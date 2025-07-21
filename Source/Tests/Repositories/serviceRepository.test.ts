import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import ServiceMongooseRepository from 'Source/Data/Repositories/serviceMongooseRepository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Service } from 'Source/Data/Models/serviceSchema';
import dayjs from 'dayjs';


describe('ServiceMongooseRepository', () => {
    let repository: ServiceMongooseRepository;
    let testServiceId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      //@ts-ignore
      await mongoose.connect(uri);
      repository = new ServiceMongooseRepository();
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
  
    it('should create a new service', async () => {
      const serviceData: Service = {
        name: 'Johnexx',
        description: 'este es un serviciotest',
        price: 30,
        duration: 12345678,
        images_galery: ['http://www.imagen.com/test'],
        enabled:true,
    }
  
      const result = await repository.createService(serviceData);
      expect(result).toBeDefined();

      //@ts-ignore entorno de testing
      testServiceId = result?._id;
    });
  
    it('should get a service by id', async () => {
      const service = await repository.getServiceById(testServiceId);
      
      expect(service).toBeDefined();
      expect(service?._id).toEqual(testServiceId);
    });
  
    it('should get all services', async () => {
      const result = await repository.getAll({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      if(result)
      expect(result.docs.length).toBeGreaterThan(0);
    });
  
    it('should update a service', async () => {
      const updateData = {duration:50};
      // @ts-ignore entorno de testing
      const updatedService = await repository.updateService(testServiceId, updateData);
      expect(updatedService).toBeDefined();

    });
  
    it('should delete a service', async () => {
      const result = await repository.deleteService(testServiceId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when service not found', async () => {
      await expect(repository.getServiceById(new mongoose.Types.ObjectId())).rejects.toThrow('Service not found');
    });
  });