import HairdresserManager from 'Source/Domain/Manager/hairdresserManager'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Criteria, IdMongo } from 'Source/Utils/Types/typesMongoose'
import mongoose from 'mongoose'
import { Hairdresser } from 'Source/Data/Models/hairdresserSchema'
import { Service } from 'Source/Data/Models/serviceSchema'

const mockHairdresserRepository = {
    getAll: vi.fn().mockResolvedValue([]), // Mock de respuesta para getAll
    getHairdresserById: vi.fn(),
    createHairdresser: vi.fn(),
    updateHairdresser: vi.fn(),
    deleteHairdresser: vi.fn()
  }

  vi.mock('../../container', () => ({
    default: {
      resolve: vi.fn(() => mockHairdresserRepository)
    }
  }))

describe('HairdresserManager', () =>{
    let hairdresserManager: HairdresserManager
    beforeEach(()=>{
        hairdresserManager = new HairdresserManager()
        vi.clearAllMocks()
    })

    describe('getAll', () =>{
        it('should call hairdresserRepository.getAll with valid data', async () => {
            const criteria = { page: 1, limit: 10 }
            await hairdresserManager.getAll(criteria)
            expect(mockHairdresserRepository.getAll).toHaveBeenCalledWith(criteria)
        })
    })
    
    describe('getHairdresserById', () => {
        it('should call hairdresserRepository.getHairdresserById with valid data', async () => {
            let pid :IdMongo = new mongoose.Types.ObjectId()
            await hairdresserManager.getHairdresserById(pid)
            expect(mockHairdresserRepository.getHairdresserById).toHaveBeenCalledWith(pid)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(hairdresserManager.getHairdresserById(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    
    describe('createHairdresser', () => {
        it('should call hairdresserRepository.createHairdresser with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d14')
            const hairdresser :Hairdresser={
                user_id:uid,
                services:['60d21b4667d0d8992e610c72'] as unknown as Service[],
                state: 'Disponible',
                limit_services: [{day: 3, max: 3}]
              }
              mockHairdresserRepository.getAll.mockResolvedValue({docs: []})
             // @ts-ignore entorno de testing
            await hairdresserManager.createHairdresser(hairdresser)
            expect(mockHairdresserRepository.createHairdresser).toHaveBeenCalledWith({
                user_id:uid,
                services:['60d21b4667d0d8992e610c72'] as unknown as Service[],
                state: 'Disponible',
                limit_services: [{day: 3, max: 3}]
            })
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(hairdresserManager.createHairdresser({ user_id: invalidId } as CreateHairdresserDto)).rejects.toThrow()
          })
    })
    describe('updateHairdresser', () => {
        it('should call hairdresserRepository.updateHairdresser with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const hid :Hairdresser={
                user_id:uid,
                services:['60d21b4667d0d8992e610c72'] as unknown as Service[],
                state: 'Disponible',
                limit_services: [{day: 3, max: 3}]
              }
            await hairdresserManager.updateHairdresser(hid, uid)
            expect(mockHairdresserRepository.updateHairdresser).toHaveBeenCalledWith(hid,uid)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(hairdresserManager.updateHairdresser(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    describe('updateHairdresser', () => {
        it('should call hairdresserRepository.deleteHairdresser with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const hid :Hairdresser={
                user_id:uid,
                services:['60d21b4667d0d8992e610c72'] as unknown as Service[],
                state: 'Disponible',
                limit_services: [{day: 3, max: 3}]
              }
            await hairdresserManager.deleteHairdresser(hid.user_id)
            expect(mockHairdresserRepository.deleteHairdresser).toHaveBeenCalledWith(hid.user_id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(hairdresserManager.deleteHairdresser(invalidId as IdMongo)).rejects.toThrow()
          })
    })
})