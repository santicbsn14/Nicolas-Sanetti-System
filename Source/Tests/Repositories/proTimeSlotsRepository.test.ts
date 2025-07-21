import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import ProfessionalTimeSlotsMongooseRepository from 'Source/Data/Repositories/proTimeSlotsMongooseRepository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ProfessionalTimeSlots } from 'Source/Data/Models/professionalTimeSlotsSchema';
import dayjs from 'dayjs';


describe('ProfessionalTimeSlotsMongooseRepository', () => {
    let repository: ProfessionalTimeSlotsMongooseRepository;
    let testProfessionalTimeSlotsId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      //@ts-ignore
      await mongoose.connect(uri);
      repository = new ProfessionalTimeSlotsMongooseRepository();
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
  
    it('should create a new professionalTimeSlots', async () => {
      const professionalTimeSlotsData: ProfessionalTimeSlots = {
        hairdresser_id: new mongoose.Types.ObjectId(),
        schedule:[{week_day:1, time_slots:{start_time: dayjs(new Date()), end_time:dayjs(new Date())}}]
    }
  
      const result = await repository.createProfessionalTimeSlots(professionalTimeSlotsData);
      expect(result).toBeDefined();

      //@ts-ignore entorno de testing
      testProfessionalTimeSlotsId = result?._id;
    });
  
    it('should get a professionalTimeSlots by id', async () => {
      const professionalTimeSlots = await repository.getProfessionalTimeSlotsById(testProfessionalTimeSlotsId);
      
      expect(professionalTimeSlots).toBeDefined();
      expect(professionalTimeSlots?._id).toEqual(testProfessionalTimeSlotsId);
    });
  
    it('should get all professionalTimeSlotss', async () => {
      const result = await repository.getAll({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      if(result)
      expect(result.docs.length).toBeGreaterThan(0);
    });
  
    it('should update a professionalTimeSlots', async () => {
      const updateData = [{week_day:4, time_slots:{start_time: dayjs(new Date()), end_time:dayjs(new Date())}}];
      // @ts-ignore entorno de testing
      const updatedProfessionalTimeSlots = await repository.updateProfessionalTimeSlots(testProfessionalTimeSlotsId, updateData);
      expect(updatedProfessionalTimeSlots).toBeDefined();

    });
  
    it('should delete a professionalTimeSlots', async () => {
      const result = await repository.deleteProfessionalTimeSlots(testProfessionalTimeSlotsId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when professionalTimeSlots not found', async () => {
      await expect(repository.getProfessionalTimeSlotsById(new mongoose.Types.ObjectId())).rejects.toThrow('ProfessionalTimeSlots could not found');
    });
  });