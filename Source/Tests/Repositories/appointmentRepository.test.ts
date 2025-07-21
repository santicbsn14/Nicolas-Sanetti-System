import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose, {model} from 'mongoose';
import AppointmentMongooseRepository from 'Source/Data/Repositories/appointmentMongooseRepository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Appointment } from 'Source/Data/Models/appointmentSchema';
import dayjs from 'dayjs';
import clientSchema from 'Source/Data/Models/clientSchema';
import userSchema, { IUser } from 'Source/Data/Models/userSchema';
import { IdMongo } from 'typesMongoose';

describe('AppointmentMongooseRepository', () => {
    let repository: AppointmentMongooseRepository;
    let testAppointmentId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;
    let userId: mongoose.Types.ObjectId;
    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      repository = new AppointmentMongooseRepository();
      const user : IUser = await userSchema.create({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        age: 30,
        dni: 12345678,
        phone: 1234567890,
        role: new mongoose.Types.ObjectId(),
        password: 'password123',
        fuid:'jsjjsjsjsj'
      });
      userId = user._id as IdMongo; 
  
      // Crea un paciente referenciando el usuario creado
      await clientSchema.create({
        firstname: 'Johnexx',
        lastname: 'Doerexx',
        email: 'johndoe@example.com',
        age: 30,
        dni: 12345678,
        phone: 1234567890
      });
      
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
  
    it('should create a new appointment', async () => {
      const appointmentData: Appointment = { client_id: new mongoose.Types.ObjectId(),
        hairdresser_id: new mongoose.Types.ObjectId(),
        date_time: dayjs(new Date()),
        state: 'Solicitado',
        service_id: new mongoose.Types.ObjectId(),
        }
  
      const result = await repository.createAppointment(appointmentData);
      expect(result).toBeDefined();

      //@ts-ignore entorno de testing
      testAppointmentId = result?._id;
    });
  
    it('should get a appointment by id', async () => {
      
      const appointment = await repository.getAppointmentById(testAppointmentId);
      console.log(appointment)
      expect(appointment).toBeDefined();
      expect(appointment?._id).toEqual(testAppointmentId);
    });
  
    it('should get all appointments', async () => {
      const result = await repository.getAll({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      if (result) expect(result.docs.length).toBeGreaterThan(0);
  });

  it('should update a appointment', async () => {
      const updateData = { state: 'Pendiente' };
      // @ts-ignore entorno de testing
      const updatedAppointment = await repository.updateAppointment(updateData, testAppointmentId);
      expect(updatedAppointment).toBeDefined();
      expect(updatedAppointment?.state).toEqual(updateData.state);
  });
  
    it('should delete a appointment', async () => {
      const result = await repository.deleteAppointment(testAppointmentId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when appointment not found', async () => {
      await expect(repository.getAppointmentById(new mongoose.Types.ObjectId())).rejects.toThrow('Appointment could not found');
    });
  });