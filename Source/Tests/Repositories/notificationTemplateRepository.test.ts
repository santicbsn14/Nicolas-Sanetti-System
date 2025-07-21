import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import NotificationTemplateMongooseRepository from 'Source/Data/Repositories/notifTemplateMongooseRepository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotificationTemplate } from 'Source/Data/Models/notificationTemplateSchema';
import dayjs from 'dayjs';


describe('NotificationTemplateMongooseRepository', () => {
    let repository: NotificationTemplateMongooseRepository;
    let testNotificationTemplateId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      //@ts-ignore
      await mongoose.connect(uri);
      repository = new NotificationTemplateMongooseRepository();
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
  
    it('should create a new notificationTemplate', async () => {
      const notificationTemplateData: NotificationTemplate = {
        name: 'Johnexx',
        message: 'este es una notificationtest',
    }
  
      const result = await repository.createNotificationTemplate(notificationTemplateData);
      expect(result).toBeDefined();

      //@ts-ignore entorno de testing
      testNotificationTemplateId = result?._id;
    });
  
    it('should get a notificationTemplate by id', async () => {
      const notificationTemplate = await repository.getNotificationTemplateById(testNotificationTemplateId);
      
      expect(notificationTemplate).toBeDefined();
      expect(notificationTemplate?._id).toEqual(testNotificationTemplateId);
    });
  
    it('should get all notificationTemplates', async () => {
      const result = await repository.getAll({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      if(result)
      expect(result.docs.length).toBeGreaterThan(0);
    });
  
    it('should update a notificationTemplate', async () => {
      const updateData = {duration:50};
      // @ts-ignore entorno de testing
      const updatedNotificationTemplate = await repository.updateNotificationTemplate(testNotificationTemplateId, updateData);
      expect(updatedNotificationTemplate).toBeDefined();

    });
  
    it('should delete a notificationTemplate', async () => {
      const result = await repository.deleteNotificationTemplate(testNotificationTemplateId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when notificationTemplate not found', async () => {
      await expect(repository.getNotificationTemplateById(new mongoose.Types.ObjectId())).rejects.toThrow('NotificationTemplate could not found');
    });
  });