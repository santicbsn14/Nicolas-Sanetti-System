import { describe, it, expect, beforeAll, afterAll, beforeEach, test } from 'vitest';
import supertest from "supertest";
import mongoose from 'mongoose';
import { Server } from 'http';
import appointmentSchema from 'Source/Data/Models/appointmentSchema.js';
import clientSchema, { IClient } from 'Source/Data/Models/clientSchema.js';  // Asegúrate de importar los schemas correctos
import hairdresserSchema, { Hairdresser } from 'Source/Data/Models/hairdresserSchema.js';
import serviceSchema, { Service } from 'Source/Data/Models/serviceSchema.js';
import initialAppointments from './appointments.json';
import { app } from 'Source/Presentation/Application/appExpress.js';
import dayjs from 'dayjs';
import professionalTimeSlotsSchema, { ProfessionalTimeSlots } from 'Source/Data/Models/professionalTimeSlotsSchema';
import notificationTemplateSchema, { NotificationTemplate } from 'Source/Data/Models/notificationTemplateSchema';

let server: Server;
let api: ReturnType<typeof supertest>;
let clientId: string;
let hairdresserId: string;
let serviceId: string;

beforeAll(async () => {
    try {
        server = app.listen(0);
        api = supertest(server);
    
        // Crear entidades necesarias antes de todas las pruebas
        const client : IClient = await clientSchema.create({
            firstname: "Juan",
            lastname: "Pérez",
            email: "santicbsn9@gmail.com",
            age: 30,
            dni: 12345678,
            phone: 5551234567,
            appointments_history: [],
            next_appointment: "64df9c4f0a5b3a23f0e9c9f7",
            // Añade otros campos requeridos según tu schema
        });
        clientId = client._id ? client._id.toString() : '98jasnans79823hfiof';
        const service: Service= await serviceSchema.create({
            name: "Corte de cabello",
            price: 25,
            enabled: true,
            duration: 60,
            description: "Un corte de cabello profesional.",
            images_galery: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
            discount: "10%",
            limit: true,
            deadline_time: dayjs().add(7, "day")
            // Añade otros campos requeridos según tu schema
        });
        serviceId = service._id ? service._id.toString() : '82848848484hfhfhfh';
        const hairdresser : Hairdresser = await hairdresserSchema.create({
            user_id: new mongoose.Types.ObjectId(),
            _id: new mongoose.Types.ObjectId(),
            services: [service._id],
            state: "Disponible",
            limit_services: [
              {
                day: 3,
                max: 5
              }
            ]
            // Añade otros campos requeridos según tu schema
        });
        hairdresserId = hairdresser._id ?  hairdresser._id.toString() : '97999999';
        const proTimeSlots : ProfessionalTimeSlots = await professionalTimeSlotsSchema.create({
            hairdresser_id: hairdresserId,
            schedule: [{week_day:3, time_slots:{start_time:'2025-01-27T08:00:00.000Z', end_time:'2025-01-27T17:00:00.000Z'}}]
        })
        const notificationTemplate : NotificationTemplate = await notificationTemplateSchema.create({
            name: 'ConfirmationAppointment',
            message:'Felicitaciones, hemos confirmado tu turno. Te esperamos ansiosos!'
    
        })
    } catch (error) {
        console.log(error)
    }

});

beforeEach(async () => {
    await appointmentSchema.deleteMany({});
    const appointments = initialAppointments.map(appt => new appointmentSchema(appt));
    await appointmentSchema.insertMany(appointments);
});

afterAll(async () => {
    // Limpiar todas las colecciones
    await Promise.all([
        appointmentSchema.deleteMany({}),
        clientSchema.deleteMany({}),
        hairdresserSchema.deleteMany({}),
        serviceSchema.deleteMany({})
    ]);
    
    await mongoose.connection.close();
    return new Promise<void>((resolve, reject) => {
        server.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
});

describe("Testing Appointment Endpoints Success", () => {
    test('/api/appointments/', async () => {
        const { status, body } = await api.get('/api/appointments/');
        expect(status).toBe(200);
    });
       
    test('/api/appointments/?limit=2', async () => {
        const { status, body } = await api.get('/api/appointments/?limit=2');
        expect(status).toBe(200);
        expect(Array.isArray(body.appointments)).toBe(true);
        expect(body.appointments.length).toBe(2);
    });

    test('POST /api/appointments/byclient - Crear nueva cita', async () => {
        const newAppointment = {
            client_id: clientId,           // Usamos el ID del cliente creado
            hairdresser_id: hairdresserId, // Usamos el ID del profesional creado
            date_time: "2024-12-18T15:45:00Z",
            state: "Completado",
            service_id: serviceId,         // Usamos el ID del servicio creado
            notes: ["Cliente quedó satisfecho", "Agendó próxima cita en enero"]
        };

        const { status, body } = await api
            .post('/api/appointments/byclient')
            .send(newAppointment);
            
        expect(status).toBe(201);
        expect(body).toHaveProperty('_id');
        expect(body.client_id).toBe(newAppointment.client_id);
        expect(body.service_id).toBe(newAppointment.service_id);


        const appointmentInDb = await appointmentSchema.findById(body._id);
        expect(appointmentInDb).not.toBeNull();
    });

    test('POST /api/appointments/ - Falla con datos inválidos', async () => {
        const invalidAppointment = {
            name: "",
        };
        
        const { status, body } = await api
            .post('/api/appointments/byclient')
            .send(invalidAppointment);

        expect(status).toBe(400);
        expect(body).toHaveProperty('errors');
    });
    test('PUT /api/appointments/:id - Actualizar cita existente', async () => {
        const appointment = await appointmentSchema.create({
            client_id: clientId,
            hairdresser_id: hairdresserId,
            date_time: "2024-12-18T15:45:00Z",
            state: "Pendiente",
            service_id: serviceId,
            notes: []
        });
        const notificationTemplate : NotificationTemplate = await notificationTemplateSchema.create({
            name: 'UpdateAppointment',
            message:'Felicitaciones, hemos confirmado tu turno. Te esperamos ansiosos!'
    
        })
        const updatedData = {
            state: "Completado",
            notes: ["Cliente muy satisfecho"]
        };

        const { status, body } = await api
            .put(`/api/appointments/${appointment._id}`)
            .send(updatedData);
        expect(status).toBe(201);
        expect(body.state).toBe(updatedData.state);
        // expect(body.notes).toContain("Cliente muy satisfecho");

        const appointmentInDb = await appointmentSchema.findById(appointment._id);
        expect(appointmentInDb?.state).toBe(updatedData.state);
        // expect(appointmentInDb?.notes).toContain("Cliente muy satisfecho");
    });

    test('DELETE /api/appointments/:id - Eliminar cita existente', async () => {
        const notificationTemplate : NotificationTemplate = await notificationTemplateSchema.create({
            name: 'DeleteAppointment',
            message:'Felicitaciones, hemos confirmado tu turno. Te esperamos ansiosos!'
    
        })
        const appointment = await appointmentSchema.create({
            client_id: clientId,
            hairdresser_id: hairdresserId,
            date_time: "2024-12-18T15:45:00Z",
            state: "Pendiente",
            service_id: serviceId,
            notes: []
        });

        const { status, body } = await api.delete(`/api/appointments/${appointment._id}`);

        expect(status).toBe(201);
        expect(body).toMatch(/Appointment with ID .* has been successfully deleted\./);

        const appointmentInDb = await appointmentSchema.findById(appointment._id);
        expect(appointmentInDb).toBeNull();
    });

    // test('PUT /api/appointments/:id - Error al actualizar cita inexistente', async () => {
    //     const { status, body } = await api
    //         .put('/api/appointments/invalidid')
    //         .send({ state: "Completado" });

    //     expect(status).toBe(400);
    //     expect(body).toHaveProperty('error');
    // });

    // test('DELETE /api/appointments/:id - Error al eliminar cita inexistente', async () => {
    //     const { status, body } = await api.delete('/api/appointments/invalidid');
    //     expect(status).toBe(400);
    //     expect(body).toHaveProperty('error');
    // });
});