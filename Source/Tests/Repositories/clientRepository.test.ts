import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ClientMongooseRepository from 'Source/Data/Repositories/clientMongooseRepository';
import { IClient } from 'Source/Data/Models/clientSchema';
import userSchema from 'Source/Data/Models/userSchema';
import { IdMongo } from 'typesMongoose';
import { Service } from 'Source/Data/Models/serviceSchema';

describe('ClientMongooseRepository', () => {
    let repository: ClientMongooseRepository;
    let testClientId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;
    let userId: mongoose.Types.ObjectId;
    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      //@ts-ignore
      await mongoose.connect(uri);
      repository = new ClientMongooseRepository();
      const user = await userSchema.create({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        age: 30,
        dni: 12345678,
        phone: 1234567890,
        role: new mongoose.Types.ObjectId(),
        password: 'password123',
        fuid:'jjdjdjjd'
      });
      userId = user._id; 
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
  
  
    it('should create a new client', async () => {
        let uid : IdMongo = new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d14')
      const clientData: IClient = {
        firstname: 'Johnexx',
        lastname: 'Doerexx',
        email: 'johndoe@example.com',
        age: 30,
        dni: 12345678,
        phone: 1234567890
      };
  
      const result = await repository.createClient(clientData);
      expect(result).toBeDefined();

      //@ts-ignore entorno de testing
      testClientId = result?._id;
    });
  
    it('should get a client by id', async () => {
      const client = await repository.getClientById(testClientId);
      expect(client).toBeDefined();
      expect(client?._id).toEqual(testClientId);
    });
  
    it('should get all clients', async () => {
      const result = await repository.getAll({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      if(result)
      expect(result.docs.length).toBeGreaterThan(0);
    });
  
    it('should update a client', async () => {
      const updateData = { age: 33 };
      // @ts-ignore entorno de testing
      const updatedClient = await repository.updateClient(testClientId, updateData);
      console.log(updatedClient)
      expect(updatedClient).toBeDefined();
      expect(updatedClient?.age).toEqual(updateData.age);
    });
  
    it('should delete a client', async () => {
      const result = await repository.deleteClient(testClientId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when client not found', async () => {
      await expect(repository.getClientById(new mongoose.Types.ObjectId())).rejects.toThrow('Client not Found');
    });
  });