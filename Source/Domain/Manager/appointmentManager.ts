import { appointmentState, type Appointment } from "../../Data/Models/appointmentSchema"
import idValidation from "../Validations/idValidation";
import { Criteria, IdMongo } from "../../Utils/Types/typesMongoose";
import createAppointmentValidation from "../Validations/CreatesValidation/createAppointmentValidation";
import { CreateAppointmentDto} from "typesRequestDtos";
import mongoose, { Error } from "mongoose";
import { ProfessionalTimeSlots } from "Source/Data/Models/professionalTimeSlotsSchema";
import { isAvailable } from "../../Utils/scheduleUtils";
import { DailyHourAvailability, HourlySlot } from "Source/Data/Models/dailyHourASchema";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/es.js'
import { Hairdresser, limitServices } from "Source/Data/Models/hairdresserSchema";
import { Service } from "Source/Data/Models/serviceSchema";
import container from "../../container";
import { IClient } from "Source/Data/Models/clientSchema";
import { NotificationTemplate } from "Source/Data/Models/notificationTemplateSchema";



class AppointmentManager {
    private appointmentRepository
    private professionalTimeSlotRepository
    private dailyHourAvailabilityRepository
    private clientRepository
    private hairdresserRepository
    private serviceRepository
    private notificationManager
    constructor(){
        this.clientRepository = container.resolve('ClientRepository')
        this.appointmentRepository = container.resolve('AppointmentRepository');
        this.professionalTimeSlotRepository = container.resolve('ProfessionalTimeSlotsRepository')
        this.dailyHourAvailabilityRepository = container.resolve('DailyHourAvailabilityRepository')
        this.hairdresserRepository = container.resolve('HairdresserRepository')
        this.serviceRepository = container.resolve('ServiceRepository')
        this.notificationManager = container.resolve('NotificationManager')
    }
    async getAll(criteria: Criteria){
       return await this.appointmentRepository.getAll(criteria)
    }
    async getAppointmentById(id: string){
        let aid = new mongoose.Types.ObjectId(id)
        await idValidation.parseAsync(aid)
        return await this.appointmentRepository.getAppointmentById(aid)
    }
async createAppointmentByClient(bodyDto: CreateAppointmentDto): Promise<Appointment> {
    let client: IClient | undefined;
    let clientIdToSearch: string | undefined;

    // Si client_id viene como objeto, es un cliente nuevo
    if (typeof bodyDto.client_id === 'object' && bodyDto.client_id !== null) {
        const incomingClient = bodyDto.client_id as unknown as  IClient;

        // Buscar cliente por campos únicos
        const existingClient = await this.clientRepository.findClientByUniqueFields({
            email: incomingClient.email,
            dni: incomingClient.dni,
            phone: incomingClient.phone
        });

        if (existingClient) {
            client = existingClient;
        } else {
            client = await this.clientRepository.createClient(incomingClient);
        }

        clientIdToSearch = undefined;
    } else {
        // Si client_id es string, lo tomamos como un ID existente
        clientIdToSearch = bodyDto.client_id as unknown as string;
    }

    // Si hay un ID, buscamos al cliente
    let verifyClientExist: IClient | undefined;
    if (clientIdToSearch) {
        verifyClientExist = await this.clientRepository.getClientById(clientIdToSearch);
    }

    // Si no se encontró cliente con ese ID y no fue creado antes, lo creamos
    if (!verifyClientExist && !client) {
        client = await this.clientRepository.createClient(bodyDto.client_id as unknown as  IClient);
    }

    // Usar el cliente que hayamos encontrado o creado
    client = verifyClientExist || client;

    const clientId = client?._id;
    if (!clientId) {
        throw new Error("No se pudo determinar el ID del cliente.");
    }

    const body: Appointment = {
        ...bodyDto,
        client_id: clientId,
        hairdresser_id: bodyDto.hairdresser_id,
        date_time: dayjs(bodyDto.date_time),
        state: bodyDto.state,
        service_id: bodyDto.service_id,
        notes: bodyDto.notes
    };

    // await createAppointmentValidation.parseAsync(body)

    const isServiceWithLimit: Service = await this.serviceRepository.getServiceById(body.service_id);
    if (isServiceWithLimit.limit) {
        const startOfDay = dayjs(body.date_time).startOf('day').toDate();
        const endOfDay = dayjs(body.date_time).endOf('day').toDate();

        const appointmentsLimit = await this.appointmentRepository.getAll({
            hairdresser_id: body.hairdresser_id,
            date_time: { $gte: startOfDay, $lt: endOfDay }
        });

        const filtered = appointmentsLimit.docs.filter((appointment: Appointment) => {
            const service = appointment.service_id;
            return typeof service === 'object' && 'limit' in service && service.limit === true;
        });

        const hairdresserLimit: Hairdresser = await this.hairdresserRepository.getHairdresserById(body.hairdresser_id);
        const numberDay = body.date_time.day();

        const isSpaceServicesLimit = await this.spaceWithLimitServices(
            filtered.length,
            hairdresserLimit.limit_services,
            numberDay
        );

        if (!isSpaceServicesLimit) {
            throw new Error('No available slots for the selected service');
        }
    }

    const proTimeSlots: ProfessionalTimeSlots = await this.professionalTimeSlotRepository.getProfessionalTimeSlotsByPro(body.hairdresser_id);
    if (!proTimeSlots) throw new Error('Professional not found');

    const isAvailableSlot = isAvailable(proTimeSlots.schedule, body.date_time);
    if (!isAvailableSlot) throw new Error('The professional does not work in that time slot');

    const isSlotAvailable = await this.isHourlySlotAvailable(body.date_time, body.date_time, body.hairdresser_id);
    if (!isSlotAvailable) throw new Error('No available slots for the selected time');

    const appointmentDate = dayjs(body.date_time).startOf('day');
    const hairdresserAvailability: Hairdresser = await this.hairdresserRepository.getHairdresserById(body.hairdresser_id);
    if (hairdresserAvailability.state !== 'Disponible') throw new Error('The hairdresser is not available');

    const existingAppointments = await this.appointmentRepository.getAll({
        client_id: body.client_id,
        date_time: {
            $gte: appointmentDate.toDate(),
            $lt: appointmentDate.add(1, 'day').toDate()
        }
    });

    if (existingAppointments && existingAppointments.length > 0) {
        throw new Error('El cliente ya tiene un turno asignado para esta fecha.');
    }

    body.state = 'Confirmado';
    body.date_time = dayjs(bodyDto.date_time);

    const appointment: Appointment = await this.appointmentRepository.createAppointment(body);

    const getNotification: NotificationTemplate = await this.notificationManager.getNotificationByName('ConfirmationAppointment');

    if (!client?.email) {
        throw new Error('Successful shift creation without notification sent due to absence of client email');
    }

    const dataForNotification = {
        ...appointment,
        client_id: client,
        hairdresser_id: hairdresserAvailability,
        service_id: isServiceWithLimit
    };

    await this.notificationManager.sendNotificationTemplate(
        getNotification,
        'Confirmado',
        client.email,
        dataForNotification
    );

    return appointment;
}

    async createAppointmentByHairdresser(bodyDto:CreateAppointmentDto){
        let client: IClient | undefined; 
        const clientData = bodyDto.client_id;
        const clientObjectId = '_id' in clientData ? clientData._id : undefined;
    
        if (!clientObjectId) {
            throw new Error("No se proporcionó un ID válido del cliente.");
        }
    
        const verifyClientExist = await this.clientRepository.getClientById(clientObjectId);
    
        if (!verifyClientExist) {
            client = await this.clientRepository.createClient(clientData);
        }
    
        const clientId = verifyClientExist?._id ?? client?._id;
    
        if (!clientId) {
            throw new Error("No se pudo determinar el ID del cliente.");
        }
        const body: Appointment = {...bodyDto,
            client_id: clientId,
            hairdresser_id: bodyDto.hairdresser_id,
            date_time:dayjs(bodyDto.date_time),
            state: bodyDto.state,
            service_id:bodyDto.service_id,
            notes: bodyDto.notes
        };
        await createAppointmentValidation.parseAsync(body)
        let appointment = {...body, date_time:dayjs(bodyDto.date_time)}
        const appointmentDate = dayjs(appointment.date_time).startOf('day');
        
        const existingAppointments = await this.appointmentRepository.getAll({
            client_id: body.client_id,
            date_time: {
                $gte: appointmentDate.toDate(),  
                $lt: appointmentDate.add(1, 'day').toDate()  
            }
        });
        
        if (existingAppointments && existingAppointments.docs.length > 0) {
            throw new Error('El paciente ya tiene un turno asignado para esta fecha.');
        }
        appointment.state='Confirmado'
        let getPatientEmail = await this.clientRepository.getClientById(body.client_id)
        let appointmentCreated = await this.appointmentRepository.createAppointment(appointment)
        return {getPatientEmail, appointmentCreated}
    }
    async isHourlySlotAvailable( 
        date: dayjs.Dayjs,
        startTime: dayjs.Dayjs,
        hairdresser_id?: IdMongo | string,
        duration_service?: number
    ): Promise<boolean> {
        const hourlySlots: DailyHourAvailability = await this.dailyHourAvailabilityRepository.getDailyHourAvailabilityByDate(date, hairdresser_id);
        const slotHour = startTime.toDate().getUTCHours();
        hourlySlots.hourly_slots.sort((a, b) => a.hour - b.hour);

        let calculateSlots: number = 1;
        if (duration_service) { 
            calculateSlots = 
                duration_service <= 80 ? 1 
                : duration_service <= 140 ? 2 
                : duration_service <= 200 ? 3 
                : 4;
        }
        
        const matchingSlotIndex = hourlySlots.hourly_slots.findIndex((slot: HourlySlot) => slot.hour === slotHour);

        for (let i = 0; i < calculateSlots; i++) {
            const currentSlotIndex = matchingSlotIndex + i;
            
            if (!hourlySlots.hourly_slots[currentSlotIndex]) {
                hourlySlots.hourly_slots[currentSlotIndex] = {
                    hour: slotHour + i,
                    max_sessions: 6,
                    current_sessions: 0,
                };
            }
    
            const slot = hourlySlots.hourly_slots[currentSlotIndex];
            if (slot.current_sessions >=slot.max_sessions) {
                return false;
            }
        }
    
        for (let i = 0; i < calculateSlots; i++) {
            const currentSlotIndex = matchingSlotIndex + i;
            hourlySlots.hourly_slots[currentSlotIndex].current_sessions++;
        }
    
        await this.dailyHourAvailabilityRepository.updateDailyHourAvailability(hourlySlots._id, hourlySlots);
        
        return true; 
    }
    private async spaceWithLimitServices(appointmentsLimit: number, hairDresserLimit:limitServices[], numberDay: number):   Promise<boolean>{

        let dayAndMax = hairDresserLimit.find((limit: limitServices) => limit.day === numberDay)
        if(dayAndMax){
        if(appointmentsLimit< dayAndMax.max){
          return true
        }
        return false
        }
        return false
    }
    async updateAppointment(body:Appointment, id:IdMongo){
        await idValidation.parseAsync(id)
        let getNotification : NotificationTemplate = await this.notificationManager.getNotificationByName('UpdateAppointment')
        let appointmentUpdated  = await this.appointmentRepository.updateAppointment(body, id)
        let email = appointmentUpdated.client_id.email
        await this.notificationManager.sendNotificationTemplate(getNotification, 'Actualizado', email, appointmentUpdated)
        return appointmentUpdated
    }
    async deleteAppointment(id: IdMongo){
        await idValidation.parseAsync(id);
        let appointment = await this.appointmentRepository.getAppointmentById(id);
        let email = appointment.client_id.email
        let appointmentToDelete : Appointment = await this.appointmentRepository.deleteAppointment(id);
        let getNotification : NotificationTemplate = await this.notificationManager.getNotificationByName( 'DeleteAppointment')
        await this.notificationManager.sendNotificationTemplate(email, getNotification.name, 'Eliminado', getNotification.message, appointment)
        return appointmentToDelete
    }
    async notifyAppointmentsOfTheDay(): Promise<void> {
  const today = dayjs().startOf('day');
  const tomorrow = today.add(1, 'day');

  // Traer turnos de hoy
  const appointmentsToday = await this.appointmentRepository.getAll({
    date_time: { $gte: today.toDate(), $lt: tomorrow.toDate() },
    state: 'Confirmado'
  });

  for (const appointment of appointmentsToday.docs) {
    const client = typeof appointment.client_id === 'object' ? appointment.client_id : await this.clientRepository.getClientById(appointment.client_id);
    const service = typeof appointment.service_id === 'object' ? appointment.service_id : await this.serviceRepository.getServiceById(appointment.service_id);
    const hairdresser = typeof appointment.hairdresser_id === 'object' ? appointment.hairdresser_id : await this.hairdresserRepository.getHairdresserById(appointment.hairdresser_id);

    if (!client.email) continue;

    const template = await this.notificationManager.getNotificationByName('ReminderAppointment');
    const appointmentData = {
      ...appointment,
      client_id: client,
      service_id: service,
      hairdresser_id: hairdresser
    };

    await this.notificationManager.sendNotificationTemplate(
      template,
      'Recordatorio',
      client.email,
      appointmentData
    );
  }
}

}
export default AppointmentManager