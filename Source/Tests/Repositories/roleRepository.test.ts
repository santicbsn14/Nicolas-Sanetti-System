import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Role } from 'Source/Data/Models/roleSchema';
import dayjs from 'dayjs';
import RoleMongooseRepository from 'Source/Data/Repositories/roleMongooseRepository';


describe('RoleMongooseRepository', () => {
    let repository: RoleMongooseRepository;
    let testRoleId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      //@ts-ignore
      await mongoose.connect(uri);
      repository = new RoleMongooseRepository();
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
  
    it('should create a new notificationTemplate', async () => {
      const notificationTemplateData: Role = {
        name: 'Johnexx',
        permissions: ['sAVE'],
    }
  
      const result = await repository.createRole(notificationTemplateData);
      expect(result).toBeDefined();

      //@ts-ignore entorno de testing
      testRoleId = result?._id;
    });
  
    it('should get a notificationTemplate by id', async () => {
      const notificationTemplate = await repository.getRoleById(testRoleId);
      
      expect(notificationTemplate).toBeDefined();
      expect(notificationTemplate?._id).toEqual(testRoleId);
    });
  
    it('should get all notificationTemplates', async () => {
      const result = await repository.getAll({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      if(result)
      expect(result.docs.length).toBeGreaterThan(0);
    });
  
    it('should update a notificationTemplate', async () => {
      const updateData = {name:'ss'};
      // @ts-ignore entorno de testing
      const updatedRole = await repository.updateRole(testRoleId, updateData);
      expect(updatedRole).toBeDefined();

    });
  
    it('should delete a notificationTemplate', async () => {
      const result = await repository.deleteRole(testRoleId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when notificationTemplate not found', async () => {
      await expect(repository.getRoleById(new mongoose.Types.ObjectId())).rejects.toThrow('Role dont exist.');
    });
  });