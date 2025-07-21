import ClientManager from 'Source/Domain/Manager/clientManager'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Criteria, IdMongo } from 'Source/Utils/Types/typesMongoose'
import mongoose from 'mongoose'
import { IClient } from 'Source/Data/Models/clientSchema'
import { Service } from 'Source/Data/Models/serviceSchema'

const mockClientRepository = {
    getAll: vi.fn().mockResolvedValue([]), // Mock de respuesta para getAll
    getClientById: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn()
  }

  vi.mock('../../container', () => ({
    default: {
      resolve: vi.fn(() => mockClientRepository)
    }
  }))

describe('ClientManager', () =>{
    let clientManager: ClientManager
    beforeEach(()=>{
        clientManager = new ClientManager()
        vi.clearAllMocks()
    })

    describe('getAll', () =>{
        it('should call clientRepository.getAll with valid data', async () => {
            const criteria = { page: 1, limit: 10 }
            await clientManager.getAll(criteria)
            expect(mockClientRepository.getAll).toHaveBeenCalledWith(criteria)
        })
    })
    
    describe('getClientById', () => {
        it('should call clientRepository.getClientById with valid data', async () => {
            let pid :IdMongo = new mongoose.Types.ObjectId()
            await clientManager.getClientById(pid)
            expect(mockClientRepository.getClientById).toHaveBeenCalledWith(pid)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(clientManager.getClientById(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    
    describe('createClient', () => {
        it('should call clientRepository.createClient with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d14')
            const client :IClient={
                firstname: 'Johnexx',
                lastname: 'Doerexx',
                email: 'johndoe@example.com',
                age: 30,
                dni: 12345678,
                phone: 1234567890
              }
              mockClientRepository.getAll.mockResolvedValue({docs: []})
             // @ts-ignore entorno de testing
            await clientManager.createClient(client)
            expect(mockClientRepository.createClient).toHaveBeenCalledWith({
                firstname: 'Johnexx',
                lastname: 'Doerexx',
                email: 'johndoe@example.com',
                age: 30,
                dni: 12345678,
                phone: 1234567890
            })
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(clientManager.createClient({ user_id: invalidId } as CreateClientDto)).rejects.toThrow()
          })
    })
    describe('updateClient', () => {
        it('should call clientRepository.updateClient with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const client :IClient={
                firstname: 'Johnexx',
                lastname: 'Doerexx',
                email: 'johndoe@example.com',
                age: 30,
                dni: 12345678,
                phone: 1234567890,
                _id: new mongoose.Types.ObjectId('66c65b651bb4017c5a0f3d15'),
              }
            await clientManager.updateClient(client, client._id as IdMongo)
            expect(mockClientRepository.updateClient).toHaveBeenCalledWith(client,client._id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(clientManager.updateClient(invalidId as IdMongo)).rejects.toThrow()
          })
    })
    describe('updateClient', () => {
        it('should call clientRepository.deleteClient with valid data', async () =>{
            let uid : IdMongo = new mongoose.Types.ObjectId()
            const client :IClient={
                firstname: 'Johnexx',
                lastname: 'Doerexx',
                email: 'johndoe@example.com',
                age: 30,
                dni: 12345678,
                phone: 1234567890,
                _id: new mongoose.Types.ObjectId('66c65b651bb4017c5a0f3d15'),
              }
            await clientManager.deleteClient(client._id as IdMongo)
            expect(mockClientRepository.deleteClient).toHaveBeenCalledWith(client._id)
        })
        it('should throw an error with invalid id', async () => {
            const invalidId = 'invalid-id'
            // @ts-ignore porfa
            await expect(clientManager.deleteClient(invalidId as IdMongo)).rejects.toThrow()
          })
    })
})