import ProfessionalTimeSlotsManager from 'Source/Domain/Manager/proTimeSlotsManager'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Criteria, IdMongo } from 'Source/Utils/Types/typesMongoose'
import mongoose from 'mongoose'
import { ProfessionalTimeSlots } from 'Source/Data/Models/professionalTimeSlotsSchema'
import { Service } from 'Source/Data/Models/serviceSchema'
import dayjs from 'dayjs'
import { Hairdresser } from 'Source/Data/Models/hairdresserSchema'

const mockProfessionalTimeSlotsRepository = {
    getAll: vi.fn(),
    getProfessionalTimeSlotsById: vi.fn(),
    getProfessionalTimeSlotsByPro: vi.fn(),
    createProfessionalTimeSlots: vi.fn(),
    updateProfessionalTimeSlots: vi.fn(),
    deleteProfessionalTimeSlots: vi.fn()
  }
  const mockHairdresserRepository = {
    getHairdresserById: vi.fn()
};

// Mock del contenedor para resolver ambos repositorios
vi.mock('../../container', () => ({
    default: {
        resolve: vi.fn((dependency: string) => {
            if (dependency === 'ProfessionalTimeSlotsRepository') {
                return mockProfessionalTimeSlotsRepository;
            }
            if (dependency === 'HairdresserRepository') {
                return mockHairdresserRepository;
            }
            throw new Error(`Unknown dependency: ${dependency}`);
        })
    }
}));
describe('ProfessionalTimeSlotsManager', () =>{
    let professionalTimeSlotsManager: ProfessionalTimeSlotsManager
    beforeEach(()=>{
        professionalTimeSlotsManager = new ProfessionalTimeSlotsManager()
        vi.clearAllMocks()
    })

    describe('getAll', () =>{
        it('should call professionalTimeSlotsRepository.getAll with valid data', async () => {
            const criteria = { page: 1, limit: 10 }
            await professionalTimeSlotsManager.getAll(criteria)
            expect(mockProfessionalTimeSlotsRepository.getAll).toHaveBeenCalledWith(criteria)
        })
    })
    
    describe('getProfessionalTimeSlotsById', () => {
        it('should call professionalTimeSlotsRepository.getProfessionalTimeSlotsById with valid data', async () => {
            let pid :IdMongo = new mongoose.Types.ObjectId()
            await professionalTimeSlotsManager.getProfessionalTimeSlotsById(pid)
            expect(mockProfessionalTimeSlotsRepository.getProfessionalTimeSlotsById).toHaveBeenCalledWith(pid)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(professionalTimeSlotsManager.getProfessionalTimeSlotsById(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    
    describe('createProfessionalTimeSlots', () => {
        it('should call professionalTimeSlotsRepository.createProfessionalTimeSlots with valid data', async () =>{
            let hid : IdMongo = new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d14')
            const professionalTimeSlots :ProfessionalTimeSlots={
                hairdresser_id:hid,
                schedule:[{week_day:1, time_slots:{start_time: dayjs(new Date(1701690000000)), end_time:dayjs(new Date(1701690000000))}}],
              }
              const mockHairdresser :Hairdresser={
                user_id:new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d12'),
                services:'60d21b4667d0d8992e610c72',
                state: 'Disponible',
                limit_services: [{day: 3, max: 3}]
              }
              mockHairdresserRepository.getHairdresserById.mockResolvedValue(mockHairdresser)
              mockProfessionalTimeSlotsRepository.getProfessionalTimeSlotsByPro.mockResolvedValue(null)
             // @ts-ignore entorno de testing
            await professionalTimeSlotsManager.createProfessionalTimeSlots(professionalTimeSlots)
            expect(mockProfessionalTimeSlotsRepository.createProfessionalTimeSlots).toHaveBeenCalledWith({
                hairdresser_id:hid,
                schedule:[{week_day:1, time_slots:{start_time: dayjs(new Date(1701690000000)), end_time:dayjs(new Date(1701690000000))}}],
            })
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            const mockHairdresser :Hairdresser={
                user_id:invalidId,
                services:'60d21b4667d0d8992e610c72',
                state: 'Disponible',
                limit_services: [{day: 3, max: 3}]
              }
            mockHairdresserRepository.getHairdresserById.mockResolvedValue(mockHairdresser)
            mockProfessionalTimeSlotsRepository.getProfessionalTimeSlotsByPro.mockResolvedValue(null)
            
            // @ts-ignore porfa
            await expect(professionalTimeSlotsManager.createProfessionalTimeSlots({ hairdresser_id: invalidId } as CreateProfessionalTimeSlotsDto)).rejects.toThrow()
          })
    })
    describe('updateProfessionalTimeSlots', () => {
        it('should call professionalTimeSlotsRepository.updateProfessionalTimeSlots with valid data', async () =>{
            let pid : IdMongo = new mongoose.Types.ObjectId()
            let hid : IdMongo = new mongoose.Types.ObjectId()
            const proTimeSlots :ProfessionalTimeSlots={
                hairdresser_id:hid,
                schedule:[{week_day:1, time_slots:{start_time: dayjs(new Date()), end_time:dayjs(new Date())}}],
                _id: pid
              }
            await professionalTimeSlotsManager.updateProfessionalTimeSlots( proTimeSlots._id as IdMongo, proTimeSlots)
            expect(mockProfessionalTimeSlotsRepository.updateProfessionalTimeSlots).toHaveBeenCalledWith(proTimeSlots._id, proTimeSlots)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(professionalTimeSlotsManager.updateProfessionalTimeSlots(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    describe('deleteProfessionalTimeSlots', () => {
        it('should call professionalTimeSlotsRepository.deleteProfessionalTimeSlots with valid data', async () =>{
            let hid : IdMongo = new mongoose.Types.ObjectId()
            const proTimeSlots :ProfessionalTimeSlots={
                hairdresser_id:hid,
                schedule:[{week_day:1, time_slots:{start_time: dayjs(new Date()), end_time:dayjs(new Date())}}],
                _id: new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d14')
              }
            await professionalTimeSlotsManager.deleteProfessionalTimeSlots(proTimeSlots._id as IdMongo)
            expect(mockProfessionalTimeSlotsRepository.deleteProfessionalTimeSlots).toHaveBeenCalledWith(proTimeSlots._id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(professionalTimeSlotsManager.deleteProfessionalTimeSlots(invalidId as IdMongo)).rejects.toThrow()
          })
    })
})