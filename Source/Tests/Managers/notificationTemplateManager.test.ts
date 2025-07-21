import NotificationTemplateManager from 'Source/Domain/Manager/notificationTemplateManager'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Criteria, IdMongo } from 'Source/Utils/Types/typesMongoose'
import mongoose from 'mongoose'
import { NotificationTemplate } from 'Source/Data/Models/notificationTemplateSchema'

const mockNotificationTemplateRepository = {
    getAll: vi.fn().mockResolvedValue([]), // Mock de respuesta para getAll
    getNotificationTemplateById: vi.fn(),
    createNotificationTemplate: vi.fn(),
    updateNotificationTemplate: vi.fn(),
    deleteNotificationTemplate: vi.fn()
  }

  vi.mock('../../container', () => ({
    default: {
      resolve: vi.fn(() => mockNotificationTemplateRepository)
    }
  }))

describe('NotificationTemplateManager', () =>{
    let notificationTemplateManager: NotificationTemplateManager
    beforeEach(()=>{
        notificationTemplateManager = new NotificationTemplateManager()
        vi.clearAllMocks()
    })

    describe('getAll', () =>{
        it('should call notificationTemplateRepository.getAll with valid data', async () => {
            const criteria = { page: 1, limit: 10 }
            await notificationTemplateManager.getAll(criteria)
            expect(mockNotificationTemplateRepository.getAll).toHaveBeenCalledWith(criteria)
        })
    })
    
    describe('getNotificationTemplateById', () => {
        it('should call notificationTemplateRepository.getNotificationTemplateById with valid data', async () => {
            let pid :IdMongo = new mongoose.Types.ObjectId()
            await notificationTemplateManager.getNotificationTemplateById(pid)
            expect(mockNotificationTemplateRepository.getNotificationTemplateById).toHaveBeenCalledWith(pid)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(notificationTemplateManager.getNotificationTemplateById(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    
    describe('createNotificationTemplate', () => {
        it('should call notificationTemplateRepository.createNotificationTemplate with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d14')
            const notificationTemplate :NotificationTemplate={
                name: 'Johnexx',
                message: 'este es un serviciotest',
              }
             // @ts-ignore entorno de testing
            await notificationTemplateManager.createNotificationTemplate(notificationTemplate)
            expect(mockNotificationTemplateRepository.createNotificationTemplate).toHaveBeenCalledWith({
                name: 'Johnexx',
                message: 'este es un serviciotest',
            })
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(notificationTemplateManager.createNotificationTemplate({ message: invalidId } as CreateNotificationTemplateDto)).rejects.toThrow()
          })
    })
    describe('updateNotificationTemplate', () => {
        it('should call notificationTemplateRepository.updateNotificationTemplate with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const notificationTemplate :NotificationTemplate={
                name: 'Johnexx',
                message: 'este es un serviciotest',
                _id: new mongoose.Types.ObjectId('66c65b651bb4017c5a0f3d15')
              }
            await notificationTemplateManager.updateNotificationTemplate(notificationTemplate._id as IdMongo, notificationTemplate )
            expect(mockNotificationTemplateRepository.updateNotificationTemplate).toHaveBeenCalledWith(notificationTemplate._id, notificationTemplate)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(notificationTemplateManager.updateNotificationTemplate(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    describe('deleteNotificationTemplate', () => {
        it('should call notificationTemplateRepository.deleteNotificationTemplate with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const notificationTemplate :NotificationTemplate={
                name: 'Johnexx',
                message: 'este es un serviciotest',
                _id: new mongoose.Types.ObjectId('66c65b651bb4017c5a0f3d15'),
              }
            await notificationTemplateManager.deleteNotificationTemplate(notificationTemplate._id as IdMongo)
            expect(mockNotificationTemplateRepository.deleteNotificationTemplate).toHaveBeenCalledWith(notificationTemplate._id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(notificationTemplateManager.deleteNotificationTemplate(invalidId as IdMongo)).rejects.toThrow()
          })
    })
})