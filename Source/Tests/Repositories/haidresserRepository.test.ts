import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import HairdresserMongooseRepository from 'Source/Data/Repositories/hairdresserMongooseRepository';
import { Hairdresser } from 'Source/Data/Models/hairdresserSchema';
import userSchema from 'Source/Data/Models/userSchema';
import { IdMongo } from 'typesMongoose';
import { Service } from 'Source/Data/Models/serviceSchema';

describe('HairdresserMongooseRepository', () => {
    let repository: HairdresserMongooseRepository;
    let testHairdresserId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;
    let userId: mongoose.Types.ObjectId;
    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      //@ts-ignore
      await mongoose.connect(uri);
      repository = new HairdresserMongooseRepository();
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
  
  
    it('should create a new hairdresser', async () => {
        let uid : IdMongo = new mongoose.Types.ObjectId('66c65b641bb4017c5a0f3d14')
      const hairdresserData: Hairdresser = {
        user_id:uid,
        services:['60d21b4667d0d8992e610c72'] as unknown as Service[],
        state: 'Disponible',
        limit_services: [{day: 3, max: 3}]
      };
  
      const result = await repository.createHairdresser(hairdresserData);
      expect(result).toBeDefined();

      //@ts-ignore entorno de testing
      testHairdresserId = result?._id;
    });
  
    it('should get a hairdresser by id', async () => {
      const hairdresser = await repository.getHairdresserById(testHairdresserId);
      expect(hairdresser).toBeDefined();
      expect(hairdresser?._id).toEqual(testHairdresserId);
    });
  
    it('should get all hairdressers', async () => {
      const result = await repository.getAll({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      if(result)
      expect(result.docs.length).toBeGreaterThan(0);
    });
  
    it('should update a hairdresser', async () => {
      const updateData = { state: 'Vacaciones' };
      // @ts-ignore entorno de testing
      const updatedHairdresser = await repository.updateHairdresser(testHairdresserId, updateData);
      console.log(updatedHairdresser)
      expect(updatedHairdresser).toBeDefined();
      expect(updatedHairdresser?.state).toEqual(updateData.state);
    });
  
    it('should delete a hairdresser', async () => {
      const result = await repository.deleteHairdresser(testHairdresserId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when hairdresser not found', async () => {
      await expect(repository.getHairdresserById(new mongoose.Types.ObjectId())).rejects.toThrow('Hairdresser could not found');
    });
  });