import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import DailyHourAvailabilityMongooseRepository from 'Source/Data/Repositories/dailyHourAMongooseRepository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DailyHourAvailability} from 'Source/Data/Models/dailyHourASchema'
import dayjs from 'dayjs';


describe('DailyHourAvailabilityMongooseRepository', () => {
    let repository: DailyHourAvailabilityMongooseRepository;
    let testDailyHourAvailabilityId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      //@ts-ignore
      await mongoose.connect(uri);
      repository = new DailyHourAvailabilityMongooseRepository();
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
  
    it('should create a new professionalTimeSlots', async () => {
      const dailyHourAvailability : DailyHourAvailability = {
        hairdresser_id: '66c65b641bb4017c5a0f3d14',
        date: dayjs(new Date(1701690000000)),
        hourly_slots: [
          { hour: 10, max_sessions: 6, current_sessions: 0 },
          { hour: 11, max_sessions: 6, current_sessions: 0 }
        ]
      };
  
      const result = await repository.createDailyHourAvailability(dailyHourAvailability);
      expect(result).toBeDefined();

      //@ts-ignore entorno de testing
      testDailyHourAvailabilityId = result?._id;
    });
  
    it('should get a professionalTimeSlots by id', async () => {
      const professionalTimeSlots = await repository.getDailyHourAvailabilityById(testDailyHourAvailabilityId);
      
      expect(professionalTimeSlots).toBeDefined();
      expect(professionalTimeSlots?._id).toEqual(testDailyHourAvailabilityId);
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
      const updatedDailyHourAvailability= await repository.updateDailyHourAvailability(testDailyHourAvailabilityId, updateData);
      expect(updatedDailyHourAvailability).toBeDefined();

    });
  
    it('should delete a professionalTimeSlots', async () => {
      const result = await repository.deleteDailyHourAvailability(testDailyHourAvailabilityId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when professionalTimeSlots not found', async () => {
      await expect(repository.getDailyHourAvailabilityById(new mongoose.Types.ObjectId())).rejects.toThrow('DailyHourAvailability could not found');
    });
  });