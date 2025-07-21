import mongoose, { PaginateResult } from 'mongoose';
import appointmentSchema, {Appointment} from '../Models/appointmentSchema';
import { Paginated, Criteria, IdMongo } from '../../Utils/Types/typesMongoose';


interface IAppointmentRepository{
    getAll: (criteria :Criteria)=> Promise<Paginated<Appointment>| null>,
    createAppointment: (Appointment: Appointment)=> Promise<Appointment | null>,
    getAppointmentById: (AppointmentId: IdMongo) => Promise<Appointment | null>,
    updateAppointment: (body: Partial<Appointment>, AppointmentId:IdMongo, ) => Promise<Appointment | null>,
    deleteAppointment: (AppointmentId: IdMongo) => Promise<string>,
}

class AppointmentRepository implements IAppointmentRepository{
    async getAll(criteria: Criteria):Promise<Paginated<Appointment>| null> {
      let { limit = 30, page = 1, ...filters } = criteria; 
      //@ts-ignore check
      const appointmentDocuments:PaginateResult<Appointment> = await appointmentSchema.paginate(filters, { limit, page,
        populate:[{ path: 'client_id' },
          { path: 'service_id' },
          { 
              path: 'hairdresser_id',
              populate: {
                  path: 'user_id', // Asegúrate de que este campo es el correcto
                  model: 'users' // El nombre del modelo que deseas poblar
              }
          }]
       });
  
      if(!appointmentDocuments) throw new Error('Appointments could not be accessed')
      if(!appointmentDocuments.page) appointmentDocuments.page = 1
  
      const mappedAppointments : Appointment[] = appointmentDocuments.docs.map((appointment) => {
        return {
            _id: appointment._id,
            client_id: appointment.client_id,
            hairdresser_id: appointment.hairdresser_id,
            date_time: appointment.date_time,
            state: appointment.state,
            service_id:appointment.service_id,
            notes: appointment.notes
        }
      })
      return {
        docs: mappedAppointments ,
        totalDocs: appointmentDocuments.totalDocs,
        limit: appointmentDocuments.limit,
        totalPages:appointmentDocuments.totalPages,
        pagingCounter: appointmentDocuments.pagingCounter,
        hasPrevPage: appointmentDocuments.hasPrevPage,
        hasNextPage: appointmentDocuments.hasNextPage,
        page: appointmentDocuments.page,
        prevPage: appointmentDocuments.prevPage,
        nextPage: appointmentDocuments.nextPage,
      };
    }
    async createAppointment(body: Appointment):Promise<Appointment | null>{
      const newAppointment :Appointment = await appointmentSchema.create(body)
      if(!newAppointment) throw new Error('A problem occurred when the Appointment was created')
        return {
            _id: newAppointment._id,
            client_id: newAppointment.client_id,
            hairdresser_id: newAppointment.hairdresser_id,
            date_time: newAppointment.date_time,
            state: newAppointment.state,
            service_id:newAppointment.service_id,
            notes: newAppointment.notes
        }
    }
  async getAppointmentById(id: IdMongo): Promise<Appointment | null> {

    const appointment = await appointmentSchema.findById(id).populate(['client_id', {
      path: 'hairdresser_id',
      populate: { path: 'user_id' }
    }, 'service_id'])
      if(!appointment) throw new Error('Appointment could not found')
        return {
            _id: appointment._id,
            client_id: appointment.client_id,
            hairdresser_id: appointment.hairdresser_id,
            date_time: appointment.date_time,
            state: appointment.state,
            service_id:appointment.service_id,
            notes: appointment.notes
        }
    }
    async updateAppointment(body :Partial<Appointment>, id: IdMongo):Promise<Appointment|null>{
      const updatedAppointment = await appointmentSchema.findByIdAndUpdate(id, body, 
        { new: true, runValidators: true }).populate([ {
      path: 'hairdresser_id',
      populate: { path: 'user_id' }
    },'client_id','service_id']);
      if(!updatedAppointment) throw new Error('A problem occurred when the Appointment was updated')
      
        return {
            _id: updatedAppointment._id,
            client_id: updatedAppointment.client_id,
            hairdresser_id: updatedAppointment.hairdresser_id,
            date_time: updatedAppointment.date_time,
            state: updatedAppointment.state,
            service_id:updatedAppointment.service_id,
            notes: updatedAppointment.notes
        }
    }
    async deleteAppointment(id:IdMongo):Promise<string>{
      const appointmentDeleted = await appointmentSchema.findByIdAndDelete(id)
      if(!appointmentDeleted) throw new Error('A problem occurred when the Appointment was deleted')
        return `Appointment with ID ${id} has been successfully deleted.`;
    }

  }
  export default AppointmentRepository