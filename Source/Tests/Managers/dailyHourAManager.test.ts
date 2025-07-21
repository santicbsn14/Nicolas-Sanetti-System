import DailyHourAvailabilityManager from 'Source/Domain/Manager/dailyHourAManager'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Criteria, IdMongo } from 'Source/Utils/Types/typesMongoose'
import mongoose from 'mongoose'
import { DailyHourAvailability } from 'Source/Data/Models/dailyHourASchema'
import dayjs from 'dayjs'
import { Hairdresser } from 'Source/Data/Models/hairdresserSchema'

const mockDailyHourAvailabilityRepository = {
    getAll: vi.fn().mockResolvedValue([]), // Mock de respuesta para getAll
    getDailyHourAvailabilityById: vi.fn(),
    createDailyHourAvailability: vi.fn(),
    updateDailyHourAvailability: vi.fn(),
    deleteDailyHourAvailability: vi.fn()
  }
const mockHairdresserRepository = {
    getHairdresserById: vi.fn()
};

vi.mock('../../container', () => ({
    default: {
        resolve: vi.fn((dependency: string) => {
            if (dependency === 'DailyHourAvailabilityRepository') {
                return mockDailyHourAvailabilityRepository ;
            }
            if (dependency === 'HairdresserRepository') {
                return mockHairdresserRepository;
            }
            throw new Error(`Unknown dependency: ${dependency}`);
        })
    }
}));

describe('DailyHourAvailabilityManager', () =>{
    let dailyHourAvailabilityManager: DailyHourAvailabilityManager
    beforeEach(()=>{
        dailyHourAvailabilityManager = new DailyHourAvailabilityManager()
        vi.clearAllMocks()
    })

    describe('getAll', () =>{
        it('should call dailyHourAvailabilityRepository.getAll with valid data', async () => {
            const criteria = { page: 1, limit: 10 }
            await dailyHourAvailabilityManager.getAll(criteria)
            expect(mockDailyHourAvailabilityRepository.getAll).toHaveBeenCalledWith(criteria)
        })
    })
    
    describe('getDailyHourAvailabilityById', () => {
        it('should call dailyHourAvailabilityRepository.getDailyHourAvailabilityById with valid data', async () => {
            let pid :IdMongo = new mongoose.Types.ObjectId()
            await dailyHourAvailabilityManager.getDailyHourAvailabilityById(pid as unknown as  string)
            expect(mockDailyHourAvailabilityRepository.getDailyHourAvailabilityById).toHaveBeenCalledWith(pid)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(dailyHourAvailabilityManager.getDailyHourAvailabilityById(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    
    describe('createDailyHourAvailability', () => {
        it('should call dailyHourAvailabilityRepository.createDailyHourAvailability with valid data', async () =>{
            const dailyHourAvailability : DailyHourAvailability = {
                hairdresser_id: '66c65b641bb4017c5a0f3d14',
                date: dayjs(new Date(1701690000000)),
                hourly_slots: [
                  { hour: 10, max_sessions: 6, current_sessions: 0 },
                  { hour: 11, max_sessions: 6, current_sessions: 0 }
                ]
              };
              const mockHairdresser :Hairdresser={
                user_id:'66c65b641bb4017c5a0f3d14',
                services:'60d21b4667d0d8992e610c72',
                state: 'Disponible',
                limit_services: [{day: 3, max: 3}]
              }
            mockHairdresserRepository.getHairdresserById.mockResolvedValue(mockHairdresser)
             // @ts-ignore entorno de testing
            await dailyHourAvailabilityManager.createDailyHourAvailability(dailyHourAvailability)
            expect(mockDailyHourAvailabilityRepository.createDailyHourAvailability).toHaveBeenCalledWith({
                hairdresser_id: '66c65b641bb4017c5a0f3d14',
                date: dayjs(new Date(1701690000000)).startOf('day'),
                hourly_slots: [
                  { hour: 10, max_sessions: 6, current_sessions: 0 },
                  { hour: 11, max_sessions: 6, current_sessions: 0 }
                ]
              })
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(dailyHourAvailabilityManager.createDailyHourAvailability({ user_id: invalidId } as CreateDailyHourAvailabilityDto)).rejects.toThrow()
          })
    })
    describe('updateDailyHourAvailability', () => {
        it('should call dailyHourAvailabilityRepository.updateDailyHourAvailability with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const dailyHourAvailability :DailyHourAvailability={
                hairdresser_id: '66c65b641bb4017c5a0f3d14',
                date: dayjs(new Date(1701690000000)).startOf('day'),
                hourly_slots: [
                  { hour: 10, max_sessions: 6, current_sessions: 0 },
                  { hour: 11, max_sessions: 6, current_sessions: 0 }
                ],
                _id: new mongoose.Types.ObjectId()
              }
            await dailyHourAvailabilityManager.updateDailyHourAvailability(dailyHourAvailability, dailyHourAvailability._id as IdMongo)
            expect(mockDailyHourAvailabilityRepository.updateDailyHourAvailability).toHaveBeenCalledWith(dailyHourAvailability,dailyHourAvailability._id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(dailyHourAvailabilityManager.updateDailyHourAvailability(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    describe('deleteDailyHourAvailability', () => {
        it('should call dailyHourAvailabilityRepository.deleteDailyHourAvailability with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const dailyHourAvailability :DailyHourAvailability={
                hairdresser_id: '66c65b641bb4017c5a0f3d14',
                date: dayjs(new Date(1701690000000)),
                hourly_slots: [
                  { hour: 10, max_sessions: 6, current_sessions: 0 },
                  { hour: 11, max_sessions: 6, current_sessions: 0 }
                ],
                _id:'66c65b641bb4017c5a0f3d11' as unknown as  IdMongo
              };
            await dailyHourAvailabilityManager.deleteDailyHourAvailability(dailyHourAvailability._id as IdMongo)
            expect(mockDailyHourAvailabilityRepository.deleteDailyHourAvailability).toHaveBeenCalledWith(dailyHourAvailability._id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(dailyHourAvailabilityManager.deleteDailyHourAvailability(invalidId as IdMongo)).rejects.toThrow()
          })
    })
})