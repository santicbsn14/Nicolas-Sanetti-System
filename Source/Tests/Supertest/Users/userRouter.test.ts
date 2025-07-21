import { describe, it, expect, beforeAll, afterAll, beforeEach, test } from 'vitest';
import supertest from "supertest";
import mongoose, { ObjectId } from 'mongoose';
import { Server } from 'http';
import appointmentSchema from 'Source/Data/Models/appointmentSchema.js';
import clientSchema from 'Source/Data/Models/clientSchema.js';  // Asegúrate de importar los schemas correctos
import hairdresserSchema from 'Source/Data/Models/hairdresserSchema.js';
import serviceSchema from 'Source/Data/Models/serviceSchema.js';
import { app } from 'Source/Presentation/Application/appExpress.js';
import admin from 'firebase-admin'
import { readFileSync } from 'fs';
import path from 'path';
import userSchema from 'Source/Data/Models/userSchema';

let server: Server;
let api: ReturnType<typeof supertest>;
let userId: string | null = null;


beforeAll(async () => {
    server = app.listen(0);
    api = supertest(server);
    const serviceAccountPath = path.resolve('firebase.key.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    
    // Crear entidades necesarias antes de todas las pruebas

});

beforeEach(async () => {
        await userSchema.deleteMany({});
        await userSchema.create([
          { firstname: 'John', lastname: 'Doe', email: 'johni@example.com', password: '123456', phone: '123456789', dni: '12345678', age: 30, fuid: 'some-id' },
          { firstname: 'John', lastname: 'Doe', email: 'john@gmail.com', password: '123456', phone: '123456789', dni: '12345672', age: 30, fuid: 'some-id' }
        ]);
      
});

afterAll(async () => {
    // Limpiar todas las colecciones
    await Promise.all([
        userSchema.deleteMany({}),
        clientSchema.deleteMany({}),
        hairdresserSchema.deleteMany({}),
        serviceSchema.deleteMany({})
    ]);
       // Eliminar usuarios de Firebase
       try {
        const listUsers = await admin.auth().listUsers();
        const deletePromises = listUsers.users.map(async (userRecord) => {
            try {
                // Excluir usuarios de sistema o predeterminados si es necesario
                if (!userRecord.email?.includes('@system.com')) {
                    await admin.auth().deleteUser(userRecord.uid);
                }
            } catch (error) {
                console.error(`Error al eliminar usuario de Firebase ${userRecord.uid}:`, error);
            }
        });

        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error al listar o eliminar usuarios de Firebase:', error);
    }
    await mongoose.connection.close();
    admin.app().delete();
    return new Promise<void>((resolve, reject) => {
        server.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
});

describe("Testing User Endpoints Success", () => {
    // test('POST /api/appointments/byclient - Crear nueva cita', async () => {
    //     const newUser = {
    //           firstname: 'John',
    //           lastname: 'Doe',
    //           email: 'john@example.com',
    //           password: '123456',
    //           phone: '123456789',
    //           dni: '12345678',
    //           age: 30,
    //           fuid: 'some-id'
    //         };

    //     const { status, body } = await api
    //         .post('/api/users/')
    //         .send(newUser);
            
    //     expect(status).toBe(201);
    //     expect(body).toHaveProperty('_id');



    //     const appointmentInDb = await appointmentSchema.findById(body._id);
    //     expect(appointmentInDb).not.toBeNull();
    // });
    test('/api/users/', async () => {
        const { status, body } = await api.get('/api/users/');

        expect(status).toBe(200);
    });
       
    test('/api/users/?limit=2', async () => {
        const { status, body } = await api.get('/api/users/?limit=2');
        expect(status).toBe(200);
        expect(Array.isArray(body.users)).toBe(true);
        expect(body.users.length).toBe(2);
    });
    test('POST /api/users/', async () => {
        const {status, body} = await api.post('/api/users/').send({firstname: 'Test',
                     lastname: 'User',
                     email: 'santiaguiyo3@example33.com',
                     password: '123456',
                     phone: '98765432373',
                     dni: '876543283',
                     age: 25})
        userId = body._id
        expect(status).toBe(201);
    })
    test('PUT /api/users/:id - Actualizar usuario existente', async () => {
        // Primero creamos un usuario para actualizar
        const newUserResponse = await api.post('/api/users/').send({
            firstname: 'Test',
            lastname: 'User',
            email: 'update_test@example.com',
            password:'123456',
            phone: '98765432101',
            dni: '876543213',
            age: 25
        });
    
        const newUserId = newUserResponse.body._id;
        expect(newUserResponse.status).toBe(201);

        const updatedData = {
            firstname: 'Updated',
            lastname: 'Name',
            phone: 999999999,
            password:'123456'
        };
        
        const { status, body } = await api
            .put(`/api/users/${newUserId}`)
            .send(updatedData);

        expect(status).toBe(201);
        expect(body.firstname).toBe(updatedData.firstname);
        expect(body.lastname).toBe(updatedData.lastname);
        expect(body.phone).toBe(updatedData.phone);

        // Verificar que los datos se actualizaron en la base de datos
        // const userInDb = await userSchema.findById(user._id);
        // expect(userInDb).not.toBeNull();
        // expect(userInDb?.firstname).toBe(updatedData.firstname);
        // expect(userInDb?.lastname).toBe(updatedData.lastname);
        // expect(userInDb?.phone).toBe(updatedData.phone);
    });

    test('DELETE /api/users/:id - Eliminar usuario existente', async () => {
        // Crear un nuevo usuario antes de eliminar
        const newUserResponse = await api.post('/api/users/').send({
            firstname: 'Test',
            lastname: 'User',
            email: 'delete_test@example.com',
            password: '123456',
            phone: '9876543210',
            dni: '87654321',
            age: 25
        });
    
        const newUserId = newUserResponse.body._id;
        expect(newUserResponse.status).toBe(201);
        
        // Ahora eliminar el usuario recién creado
        const { status, body } = await api.delete(`/api/users/${newUserId}`);

        expect(status).toBe(201);
        expect(body).toMatch(/User with ID .* has been successfully deleted\./);
    
        // Verificar que el usuario fue eliminado de la base de datos
        const userInDb = await userSchema.findById(newUserId);
        expect(userInDb).toBeNull();
    });
    

    test('PUT /api/users/:id - Error al actualizar usuario con ID inválido', async () => {
        const invalidId = 'new mongoose.Types.ObjectId();'
        const updatedData = {
            firstname: 'Updated',
            lastname: 'Name'
        };

        const { status, body } = await api
            .put(`/api/users/${invalidId}`)
            .send(updatedData);
        expect(status).toBe(400);
        expect(body.message).toEqual('Validation error')
    });

    test('DELETE /api/users/:id - Error al eliminar usuario con ID inválido', async () => {
        const invalidId = 'lslsllslsl'
        const { status, body } = await api
            .delete(`/api/users/${invalidId}`);
        expect(status).toBe(400);
        expect(body.message).toEqual('Validation error');
    });
})