import { describe, it, expect, beforeAll, afterAll, beforeEach, test } from 'vitest';
import supertest from "supertest";
import mongoose from 'mongoose';
import { Server } from 'http';
import { app } from 'Source/Presentation/Application/appExpress.js';
import hairdresserSchema, { Hairdresser } from 'Source/Data/Models/hairdresserSchema';
import userSchema from 'Source/Data/Models/userSchema';
import admin from 'firebase-admin'
import pkg from 'firebase-admin'
import path from 'path';
import { readFileSync } from 'fs';
import roleSchema from 'Source/Data/Models/roleSchema';
import clientSchema from 'Source/Data/Models/clientSchema';
import dailyHourASchema from 'Source/Data/Models/dailyHourASchema';
let server: Server;
let api: ReturnType<typeof supertest>;
let {auth} = pkg

const hairdresserTest = await hairdresserSchema.create({ user_id: "64f59c295c4cbd001c7e4f04", services: ["64f59c295c4cbd001c7e4f06"], state: "Disponible" })
async function generarIdToken(uid: string) {
    // Generar un custom token
    const customToken = await admin.auth().createCustomToken(uid);
    // Intercambiarlo por un ID token válido
    const signInResponse = await supertest("https://identitytoolkit.googleapis.com")
        .post(`/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`)  // Asegurate de tener FIREBASE_API_KEY en el .env
        .send({
            token: customToken,
            returnSecureToken: true
        });
        
    if (signInResponse.body.idToken) {
        return signInResponse.body.idToken;  // Este es el ID token válido
    } else {
        throw new Error("No se pudo obtener un ID token válido.");
    }
}
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
    await clientSchema.deleteMany({})
    await roleSchema.deleteMany({});
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
    await userSchema.deleteMany({});
    
    // Crear usuarios en Firebase y obtener los UIDs reales
    const user1 = await auth().createUser({
        email: "turro@example.com",
        password: "123456",
    });

    const user2 = await auth().createUser({
        email: "joturrito@gmail.com",
        password: "123456",
    });
    const adminRole = await roleSchema.create({
        name: "Admin",
        permissions: ["CreateHairdresser", 'GetUserById', 'UpdateUser', 'DeleteUser', 'CreateDailyHourAvailability', 'GetDailyHourAvailability', 'UpdateDailyHourAvailability', 'DeleteDailyHourAvailability'] // Agregamos permisos específicos
    });
    // Usar los UIDs de Firebase en MongoDB
    await userSchema.create([
        { firstname: "John", lastname: "Doe", email: "turro@example.com", password: "123456", phone: "123456789", dni: "1234567833", age: 30, fuid: user1.uid,  role: adminRole._id },
        { firstname: "John", lastname: "Doe", email: "joturrito@gmail.com", password: "123456", phone: "123456789", dni: "1234567233", age: 30, fuid: user2.uid }
    ]);
    await dailyHourASchema.create([
        { hairdresser_id: "64df9c4f0a5b3a23f0e9c9f7", date: new Date(),hourly_slots:[{hour:8, max_sessions:3, current_sessions:1}]},
        { hairdresser_id: "64df9c4f0a5b3a23f0e9c9f6", date: new Date(),hourly_slots:[{hour:8, max_sessions:3, current_sessions:1}]}
    ]);
});
describe('Testing ENDpoints DailyHourAvailability', () => { 
    test('GET /api/dailyHourAvailability/', async () => {
        const { status, body } = await api.get('/api/dailyHourAvailability/');
        expect(status).toBe(201);
    });
    test('GET /api/dailyHourAvailability/?limit=2', async () => {
        const { status, body } = await api.get('/api/dailyHourAvailability/?limit=2');
        expect(status).toBe(201);

        expect(Array.isArray(body.dailyHourAvailability)).toBe(true);
        expect(body.dailyHourAvailability.length).toBe(2);
    });
    test('POST /api/dailyHourAvailability/', async () => {
                const user = await userSchema.findOne({ email: "turro@example.com" })
                // Generar un token válido con el fuid del usuario
                const token = await generarIdToken(user?.fuid as string);
                
        const { status, body } = await api.post('/api/dailyHourAvailability/').send({ hairdresser_id: hairdresserTest._id, date: new Date(),hourly_slots:[{hour:8, max_sessions:3, current_sessions:1}]}).set("Authorization", `Bearer ${token}`);
        expect(status).toBe(201);
        expect(body.hairdresser_id).toBe(hairdresserTest._id.toString())
    })
    test('GETBYID /api/dailyHourAvailability/:id', async () => {
        const user = await userSchema.findOne({ email: "turro@example.com" })
        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string);
        const dailyHourAvailability = await api.post('/api/dailyHourAvailability/').send({ hairdresser_id: hairdresserTest._id, date: new Date(),hourly_slots:[{hour:8, max_sessions:3, current_sessions:1}]}).set("Authorization", `Bearer ${token}`);
        expect(dailyHourAvailability.status).toBe(201);
        const { status, body } = await api.get(`/api/dailyHourAvailability/${dailyHourAvailability.body._id}`).set("Authorization", `Bearer ${token}`);
        expect(status).toBe(200)
    })
    test('UPDATE /api/dailyHourAvailability/:id', async () => {
        const user = await userSchema.findOne({ email: "turro@example.com" })
        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string);
        const dailyHourAvailability = await api.post('/api/dailyHourAvailability/').send({ hairdresser_id: hairdresserTest._id, date: new Date(),hourly_slots:[{hour:8, max_sessions:3, current_sessions:1}]}).set("Authorization", `Bearer ${token}`);
        expect(dailyHourAvailability.status).toBe(201);
        let dailyHAupdated = {date : new Date("2024-02-24T12:00:00.000Z")}
        const { status, body } = await api.put(`/api/dailyHourAvailability/${dailyHourAvailability.body._id}`).set("Authorization", `Bearer ${token}`).send(dailyHAupdated);
        console.log(body)
        expect(status).toBe(201)
    })
    test('DELETE /api/dailyHourAvailability/:id', async () => {
        const user = await userSchema.findOne({ email: "turro@example.com" })
        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string);
        const dailyHourAvailability = await api.post('/api/dailyHourAvailability/').send({ hairdresser_id: hairdresserTest._id, date: new Date(),hourly_slots:[{hour:8, max_sessions:3, current_sessions:1}]}).set("Authorization", `Bearer ${token}`);
        expect(dailyHourAvailability.status).toBe(201);
        const { status, body } = await api.delete(`/api/dailyHourAvailability/${dailyHourAvailability.body._id}`).set("Authorization", `Bearer ${token}`);
        expect(status).toBe(201)
    })
})