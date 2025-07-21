import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import UserMongooseRepository from 'Source/Data/Repositories/userMongooseRepository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { IUser } from 'Source/Data/Models/userSchema';
import roleSchema from 'Source/Data/Models/roleSchema';

describe('UserMongooseRepository', () => {
    let repository: UserMongooseRepository;
    let testUserId: mongoose.Types.ObjectId;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      //@ts-ignore
      await mongoose.connect(uri);
      repository = new UserMongooseRepository();
      const role = await roleSchema.create({
        name:'admin',
        permissions:[`Create all`]
      })
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
    it('should create a new user', async () => {
      const userData: IUser = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        age: 30,
        dni: 12345678,
        phone: 1234567890,
        role: new mongoose.Types.ObjectId(),
        fuid:'jjsjsjjs',
        password: 'password123'
      };
  
      const result = await repository.createUser(userData);
      expect(result).toBeDefined();
      expect(result?.email).toBe(userData.email);
      //@ts-ignore entorno de testing
      testUserId = result?._id;
    });
  
    it('should get a user by id', async () => {
      const user = await repository.getUserById(testUserId);
      expect(user).toBeDefined();
      expect(user?._id).toEqual(testUserId);
    });
  
    it('should get all users', async () => {
      const result = await repository.getAll({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      expect(result.docs.length).toBeGreaterThan(0);
    });
  
    it('should update a user', async () => {
      const updateData = { firstname: 'Jane' };
      const updatedUser = await repository.updateUser(testUserId, updateData);
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.firstname).toBe('Jane');
    });
  
    it('should delete a user', async () => {
      const result = await repository.deleteUser(testUserId);
      expect(result).toContain('successfully deleted');
    });
  
    it('should throw an error when user not found', async () => {
      await expect(repository.getUserById(new mongoose.Types.ObjectId())).rejects.toThrow('User not Found');
    });
  });