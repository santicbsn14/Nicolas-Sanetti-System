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
let server: Server;
let api: ReturnType<typeof supertest>;
let {auth} = pkg

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
    await hairdresserSchema.deleteMany({});
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
        permissions: ["CreateHairdresser", 'GetUserById', 'UpdateUser', 'DeleteUser'] // Agregamos permisos específicos
    });
    // Usar los UIDs de Firebase en MongoDB
    await userSchema.create([
        { firstname: "John", lastname: "Doe", email: "turro@example.com", password: "123456", phone: "123456789", dni: "1234567833", age: 30, fuid: user1.uid,  role: adminRole._id },
        { firstname: "John", lastname: "Doe", email: "joturrito@gmail.com", password: "123456", phone: "123456789", dni: "1234567233", age: 30, fuid: user2.uid }
    ]);

    await clientSchema.create([
        { firstname: "santiago", lastname: 'Viale',email: "turreo@example.com", phone: "123456789", dni: "12345678313", age: 30 },
        { firstname: "santiago", lastname: 'Viale',email: "turro2s@example.com", phone: "1223456789", dni: "1244234567833", age: 30 }
    ]);
});
describe('Testing ENDpoints Clients', () => { 
    test('GET /api/clients/', async () => {
        const { status, body } = await api.get('/api/clients/');
        expect(status).toBe(201);
    });
    test('GET /api/clients/?limit=2', async () => {
        const { status, body } = await api.get('/api/clients/?limit=2');
        expect(status).toBe(201);

        expect(Array.isArray(body.clients)).toBe(true);
        expect(body.clients.length).toBe(2);
    });
    test('POST /api/clients/', async () =>{
        const user = await userSchema.findOne({ email: "turro@example.com" });

        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string)
        const {status, body} = await api.post('/api/clients').set("Authorization", `Bearer ${token}`).send({ firstname: "santiago", lastname: 'Viale',email: "turreosession@example.com", phone: 123456789, dni: 123422213, age: 30 })
        
        expect(status).toBe(201);
        expect(body.firstname).toBe('santiago')
        expect(body.phone).toBe(123456789)
    })
    test('GET X ID /api/clients/:id', async () => {
        const user = await userSchema.findOne({ email: "turro@example.com" });
        const client = await clientSchema.findOne({email:'turreo@example.com'})
        const idString = client?._id.toString()
        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string);

        const {status, body} = await api.get(`/api/clients/${idString}`).set("Authorization", `Bearer ${token}`)

        expect(status).toBe(200)
    })
    test('PUT /api/clients/:id', async () => {
        const user = await userSchema.findOne({ email: "turro@example.com" });
        const client = await clientSchema.findOne({email:'turreo@example.com'})
        const idString = client?._id.toString()
        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string);
        const newState = {phone: 3364022363}
        const {status, body} = (await api.put(`/api/clients/${idString}`).send(newState).set("Authorization", `Bearer ${token}`))
        expect(status).toBe(201)
        expect(body.phone).toBe(3364022363)
    })
    test('DELTE /api/clients/:id', async () => {
        const user = await userSchema.findOne({ email: "turro@example.com" });
        const client = await clientSchema.findOne({email:'turreo@example.com'});
        const idString = client?._id.toString();
        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string);
        const {status, body} = (await api.delete(`/api/clients/${idString}`).set("Authorization", `Bearer ${token}`));
        expect(status).toBe(201)
    })
 })