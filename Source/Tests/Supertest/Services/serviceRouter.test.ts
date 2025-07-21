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
import serviceSchema from 'Source/Data/Models/serviceSchema';
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
        permissions: ["CreateService", 'GetServiceById', 'DeleteService', 'UpdateService'] // Agregamos permisos específicos
    });
    // Usar los UIDs de Firebase en MongoDB
    await userSchema.create([
        { firstname: "John", lastname: "Doe", email: "turro@example.com", password: "123456", phone: "123456789", dni: "1234567833", age: 30, fuid: user1.uid,  role: adminRole._id },
        { firstname: "John", lastname: "Doe", email: "joturrito@gmail.com", password: "123456", phone: "123456789", dni: "1234567233", age: 30, fuid: user2.uid }
    ]);

    await serviceSchema.create([
        { name: "Color", price: 500,enabled: true, duration: 50, description: "Este es un servicio creado para ser testeado", images_galery: ['http://imagetest'] },
        { name: "santiago", price: 500,enabled: true,duration: 50, description: "Este es un servicio creado para ser testeado", images_galery: ['http://imagetest'] }
    ]);
});
describe('Testing ENDpoints Service', () => { 
    test('GET /api/service/', async () => {
        const { status, body } = await api.get('/api/service/');
        expect(status).toBe(201);
    });
    test('GET /api/service/?limit=2', async () => {
        const { status, body } = await api.get('/api/service/?limit=2');
        expect(status).toBe(201);

        expect(Array.isArray(body.services)).toBe(true);
        expect(body.services.length).toBe(2);
    });
    test('POST /api/service/', async () =>{
        const user = await userSchema.findOne({ email: "turro@example.com" });

        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string)
        const {status, body} = await api.post('/api/service').set("Authorization", `Bearer ${token}`).send({ name: "Color", price: 500,enabled: true, duration: 50, description: "Este es un servicio creado para ser testeado", images_galery: ['http://imagetest'] })
        
        expect(status).toBe(201);
        expect(body.name).toBe('Color')
        expect(body.price).toBe(500)
    })
    test('GET X ID /api/service/:id', async () => {
        const user = await userSchema.findOne({ email: "turro@example.com" });
        const client = await serviceSchema.findOne({name:'Color'})
        const idString = client?._id.toString()
        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string);

        const {status, body} = await api.get(`/api/service/${idString}`).set("Authorization", `Bearer ${token}`)

        expect(status).toBe(200)
    })
    test('PUT /api/service/:id', async () => {
        const user = await userSchema.findOne({ email: "turro@example.com" });
        const client = await clientSchema.findOne({name:'Color'})
        const idString = client?._id.toString()
        // Generar un token válido con el fuid del usuario
        const token = await generarIdToken(user?.fuid as string);
        const newDuration = {duration: 57}
        const {status, body} = (await api.put(`/api/service/${idString}`).send(newDuration).set("Authorization", `Bearer ${token}`))
        expect(status).toBe(201)
        expect(body.duration).toBe(57);
    })
    // test('DELETE /api/service/:id', async () => {
    //     const user = await userSchema.findOne({ email: "turro@example.com" });
    //     const client = await clientSchema.findOne({email:'turreo@example.com'});
    //     const idString = client?._id.toString();
    //     // Generar un token válido con el fuid del usuario
    //     const token = await generarIdToken(user?.fuid as string);
    //     const {status, body} = (await api.delete(`/api/service/${idString}`).set("Authorization", `Bearer ${token}`));
    //     expect(status).toBe(201)
    // })
 })