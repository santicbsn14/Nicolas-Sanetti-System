import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Criteria, IdMongo } from 'Source/Utils/Types/typesMongoose'
import AppointmentManager from '../../Domain/Manager/appointmentManager';
import { ProfessionalTimeSlots } from '../../Data/Models/professionalTimeSlotsSchema';
import { DailyHourAvailability, HourlySlot } from '../../Data/Models/dailyHourASchema';
import { CreateAppointmentDto } from 'typesRequestDtos';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { Appointment, appointmentState } from 'Source/Data/Models/appointmentSchema';
import { Service } from 'Source/Data/Models/serviceSchema';
import { Hairdresser } from 'Source/Data/Models/hairdresserSchema';
import { NotificationTemplate } from 'Source/Data/Models/notificationTemplateSchema';
import { ClientModel, IClient } from 'Source/Data/Models/clientSchema';


const mockAppointmentRepository = {
    getAll: vi.fn().mockResolvedValue([]),
    getAppointmentById: vi.fn(),
    createAppointment: vi.fn(),
    updateAppointment: vi.fn(),
    deleteAppointment: vi.fn(),
  };
  
  const mockProfessionalTimeSlotRepository = {
    getProfessionalTimeSlotsByPro: vi.fn()
  };
  
  const mockDailyHourAvailabilityRepository = {
    getDailyHourAvailabilityByDate: vi.fn(),
    updateDailyHourAvailability: vi.fn(),
  };
  const mockClientRepository = {
    getClientById: vi.fn(),
    createClient: vi.fn(),
  };
  const mockServiceRepository = {
    getServiceById : vi.fn()
  }
  const mockHairdresserRepository = {
    getHairdresserById : vi.fn()
  }
  const mockNotificationManager = {
    getNotificationByName: vi.fn(),
    sendNotificationTemplate: vi.fn()
  }
  // Mock container
  vi.mock('../../container', () => ({
    default: {
      resolve: vi.fn((name: string) => {
        switch (name) {
          case 'AppointmentRepository':
            return mockAppointmentRepository;
          case 'ProfessionalTimeSlotsRepository':
            return mockProfessionalTimeSlotRepository;
          case 'DailyHourAvailabilityRepository':
            return mockDailyHourAvailabilityRepository;
            case 'ClientRepository':
                return mockClientRepository;
            case 'ServiceRepository':
                return mockServiceRepository;
                case 'HairdresserRepository':
                    return mockHairdresserRepository;
                    case 'NotificationManager':
                    return mockNotificationManager;
          default:
            throw new Error(`Unknown repository: ${name}`);
        }
      })
    }
  }));
  
  vi.mock('../Validations/idValidation', () => ({
    parseAsync: vi.fn()
  }));
  
  vi.mock('../Validations/CreatesValidation/createAppointmentValidation', () => ({
    parseAsync: vi.fn()
  }));
  
  vi.mock('../../Utils/scheduleUtils', () => ({
    isAvailable: vi.fn().mockImplementation((schedule, slot) => {
        return true;
      })
  }));
  
  describe('AppointmentManager', () => {
    let manager: AppointmentManager;
  
    beforeEach(() => {
      manager = new AppointmentManager();
      vi.clearAllMocks();
    });
    it('should create an appointment by appointment', async () => {
      const dto: CreateAppointmentDto = {
        client_id: '60d21b4667d0d8992e610c85' as unknown as ClientModel,
        hairdresser_id: '60d21b4667d0d8992e610c86',
        date_time: dayjs(new Date()),
        service_id: '60d21b4667d0d8992e610c28',
        state: 'Solicitado',
        notes: ['Testeando']
      };
      const mockService : Service = {
        name: 'Balayage',
        price: 1000,
        enabled: true,
        duration: 80,
        description: "Lorem impusm because  i don't now that out here",
        images_galery: ['http://js.com/'],
        limit:false
      };
      const mockClient : IClient = {
        firstname:'Santi',
        lastname: 'TEST',
        email: 'SANTI@TEST.COM',
        _id: '60d21b4667d0d8992e610c85' as unknown as IdMongo,
        dni:45678389,
        phone: 3364022345,
        age:21
      }
      const mockProTimeSlots: ProfessionalTimeSlots = {
        hairdresser_id:'60d21b4667d0d8992e610c86' as unknown as IdMongo,
        schedule:[{week_day:1, time_slots:{start_time:dayjs("2024-08-30T08:00:00Z"), end_time:dayjs("2024-08-30T13:00:00Z")}}]
      };
      const mockNotificationTemplate :NotificationTemplate = {
        name:'ConfirmationAppointment',
        message: 'Hola confirmaste turno test'
      }
      const mockHairdresser :Hairdresser={
        user_id:'',
        services:'60d21b4667d0d8992e610c72',
        state: 'Disponible',
        limit_services: [{day: 3, max: 3}]
      }
      const mockHourlySlots: DailyHourAvailability = {
        date:dayjs("2024-08-30T09:00:00Z"),
        hairdresser_id:'60d21b4667d0d8992e610c86' as unknown as IdMongo,
        hourly_slots:[{hour:8, max_sessions:6, current_sessions:2}]
      };
      mockServiceRepository.getServiceById.mockResolvedValue(mockService)
      mockClientRepository.getClientById.mockResolvedValue(mockClient)
      mockProfessionalTimeSlotRepository.getProfessionalTimeSlotsByPro.mockResolvedValue(mockProTimeSlots);
      mockDailyHourAvailabilityRepository.getDailyHourAvailabilityByDate.mockResolvedValue(mockHourlySlots);
      mockAppointmentRepository.getAll.mockResolvedValue([])
      mockHairdresserRepository.getHairdresserById.mockResolvedValue(mockHairdresser)
      mockNotificationManager.getNotificationByName.mockResolvedValue(mockNotificationTemplate)
      vi.spyOn(manager, 'isHourlySlotAvailable' as never).mockResolvedValue(true);
      mockAppointmentRepository.createAppointment.mockResolvedValue(dto);
      dto.state='Confirmado'
      const result = await manager.createAppointmentByClient(dto);
      expect(result).toBeDefined();
      expect(mockAppointmentRepository.createAppointment).toHaveBeenCalledWith(expect.objectContaining(dto))
      expect(mockNotificationManager.sendNotificationTemplate).toHaveBeenCalledWith(
        mockClient?.email, 
        mockNotificationTemplate.name, 
        'Confirmado', 
        mockNotificationTemplate.message
      );
    });
    it('should call appointmentRepository.getAll with valid data', async () => {
        const criteria = { page: 1, limit: 10 }
        await manager.getAll(criteria)
        expect(mockAppointmentRepository.getAll).toHaveBeenCalledWith(criteria)
    })
    it('should return true and update availability if slot is available and not full', async () => {
        const date = dayjs("2024-08-30T09:00:00Z");
        const startTime = dayjs("2024-08-30T09:00:00Z");
        const hairdresser_id = '60d21b4667d0d8992e610c86' as unknown as IdMongo;

        const mockHourlySlots: DailyHourAvailability = {
            _id: new mongoose.Types.ObjectId(),
            date,
            hairdresser_id,
            hourly_slots: [{ hour: 9, max_sessions: 6, current_sessions: 2 }]
        };

        mockDailyHourAvailabilityRepository.getDailyHourAvailabilityByDate.mockResolvedValue(mockHourlySlots);

        const result = await manager.isHourlySlotAvailable(date, startTime, hairdresser_id);

        expect(result).toBe(true);
        expect(mockDailyHourAvailabilityRepository.updateDailyHourAvailability).toHaveBeenCalledWith(
            mockHourlySlots._id,
            expect.objectContaining({
                hourly_slots: [{ hour: 9, max_sessions: 6, current_sessions: 3 }]
            })
        );
    });
  describe('isHourlySlotAvailable', () => {
    it('should return true if slot is available', async () => {
      const mockDailyHourAvailability = {
        _id: 'dailyId',
        hourly_slots: [
          { hour: 10, max_sessions: 6, current_sessions: 0 },
          { hour: 11, max_sessions: 6, current_sessions: 0 }
        ]
      };

     mockDailyHourAvailabilityRepository.getDailyHourAvailabilityByDate.mockResolvedValue(mockDailyHourAvailability);
     mockDailyHourAvailabilityRepository.updateDailyHourAvailability.mockResolvedValue({});

      const result = await manager.isHourlySlotAvailable(
        dayjs(),
        dayjs().hour(10),
        new mongoose.Types.ObjectId(),
        60
      );

      expect(result).toBe(true);
    });

    it('should return false if slot is full', async () => {
      const mockDailyHourAvailability = {
        _id: 'dailyId',
        hourly_slots: [
          { hour: 13, max_sessions: 6, current_sessions: 6 }
        ]
      };

      mockDailyHourAvailabilityRepository.getDailyHourAvailabilityByDate.mockResolvedValue(mockDailyHourAvailability);

      const result = await manager.isHourlySlotAvailable(
        dayjs(),
        dayjs().hour(10),
        new mongoose.Types.ObjectId(),
        60
      );

      expect(result).toBe(false);
    });
  });
});