import ServiceManager from 'Source/Domain/Manager/serviceManager'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Criteria, IdMongo } from 'Source/Utils/Types/typesMongoose'
import mongoose from 'mongoose'
import { Service } from 'Source/Data/Models/serviceSchema'

const mockServiceRepository = {
    getAll: vi.fn().mockResolvedValue([]), // Mock de respuesta para getAll
    getServiceById: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    deleteService: vi.fn()
  }

  vi.mock('../../container', () => ({
    default: {
      resolve: vi.fn(() => mockServiceRepository)
    }
  }))

describe('ServiceManager', () =>{
    let serviceManager: ServiceManager
    beforeEach(()=>{
        serviceManager = new ServiceManager()
        vi.clearAllMocks()
    })

    describe('getAll', () =>{
        it('should call serviceRepository.getAll with valid data', async () => {
            const criteria = { page: 1, limit: 10 }
            await serviceManager.getAll(criteria)
            expect(mockServiceRepository.getAll).toHaveBeenCalledWith(criteria)
        })
    })
    
    describe('getServiceById', () => {
        it('should call serviceRepository.getServiceById with valid data', async () => {
            let pid :IdMongo = new mongoose.Types.ObjectId()
            await serviceManager.getServiceById(pid)
            expect(mockServiceRepository.getServiceById).toHaveBeenCalledWith(pid)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(serviceManager.getServiceById(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    
    describe('createService', () => {
        it('should call serviceRepository.createService with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d14')
            const service :Service={
                name: 'Johnexx',
                description: 'este es un serviciotest',
                price: 30,
                duration: 12345678,
                images_galery: ['http://www.imagen.com/test'],
                enabled:true,
              }
              mockServiceRepository.getAll.mockResolvedValue({docs: []})
             // @ts-ignore entorno de testing
            await serviceManager.createService(service)
            expect(mockServiceRepository.createService).toHaveBeenCalledWith({
                name: 'Johnexx',
                description: 'este es un serviciotest',
                price: 30,
                duration: 12345678,
                images_galery: ['http://www.imagen.com/test'],
                enabled:true
            })
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(serviceManager.createService({ user_id: invalidId } as CreateServiceDto)).rejects.toThrow()
          })
    })
    describe('updateService', () => {
        it('should call serviceRepository.updateService with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const service :Service={
                name: 'Johnexx',
                description: 'este es un serviciotest',
                price: 30,
                duration: 12345678,
                images_galery: ['http://www.imagen.com/test'],
                enabled:true,
                _id: new mongoose.Types.ObjectId('66c65b651bb4017c5a0f3d15')
              }
            await serviceManager.updateService(service, service._id as IdMongo)
            expect(mockServiceRepository.updateService).toHaveBeenCalledWith(service,service._id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(serviceManager.updateService(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    describe('deleteService', () => {
        it('should call serviceRepository.deleteService with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const service :Service={
                name: 'Johnexx',
                description: 'este es un serviciotest',
                price: 30,
                duration: 12345678,
                images_galery: ['http://www.imagen.com/test'],
                enabled:true,
                _id: new mongoose.Types.ObjectId('66c65b651bb4017c5a0f3d15'),
              }
            await serviceManager.deleteService(service._id as IdMongo)
            expect(mockServiceRepository.deleteService).toHaveBeenCalledWith(service._id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(serviceManager.deleteService(invalidId as IdMongo)).rejects.toThrow()
          })
    })
})