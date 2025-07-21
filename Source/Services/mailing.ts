import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
// import Handlebars  from "handlebars";
import {resolve} from 'path';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');
import { Appointment } from 'Source/Data/Models/appointmentSchema';

const transport = nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
        user:process.env.EMAIL,
        pass:process.env.KEY_MAIL
    }
})

const templatePath= resolve('source/Presentation/Templates/forgotpassword.hbs')
// const source = fs.readFileSync(templatePath).toString()
// const template = Handlebars.compile(source)
export const mailForDeleteAppointment = (userEmail: string) => {
    transport.sendMail({
        from: 'Santiago Viale',
        to: userEmail,
        html: '<h2>Te contactamos desde GyM para notificarte de la cancelacion de tu turno! </h2>'
    });
};
function formatAppointmentDetails(appointment: any) {
  const client = appointment.client_id;
  const hairdresser = appointment.hairdresser_id;
  const service = appointment.service_id;
  const dateTime = dayjs(appointment.date_time).format('dddd D [de] MMMM [a las] HH:mm'); // Ej: martes 25 de junio a las 14:00

  return `
    <ul>
      <li><strong>Cliente:</strong> ${client.firstname} ${client.lastname}</li>
      <li><strong>Profesional:</strong> ${hairdresser.user_id.firstname} ${hairdresser.user_id.lastname}</li>
      <li><strong>Servicio:</strong> ${service.name}</li>
      <li><strong>Fecha y hora:</strong> ${dateTime}</li>
    </ul>
  `;
}

export const mailForConfirmAppointment = (userEmail: string, nameNotification: string, state: string, message:string, appointment: Appointment) => {
    const appointmentHtml = formatAppointmentDetails(appointment);
    try {
        transport.sendMail({
            from: 'Santiago Viale <noreply@gym.com>',
            to: userEmail,
            subject: 'Estado de tu turno en Gym',
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${nameNotification}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #000000;
                margin: 0;
                padding: 0;
            }
            .email-container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #000000;
                color: #ffffff;
                border: 1px solid #d4af37;
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                background-color: #d4af37;
                color: #000000;
                text-align: center;
                padding: 20px;
                font-size: 24px;
                font-weight: bold;
            }
            .body {
                padding: 20px;
                text-align: center;
            }
            .body p {
                margin: 0 0 20px;
                line-height: 1.6;
                font-size: 16px;
            }
            .footer {
                background-color: #111111;
                color: #d4af37;
                text-align: center;
                padding: 10px;
                font-size: 12px;
            }
            .button {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #d4af37;
                color: #000000;
                text-decoration: none;
                font-weight: bold;
                border-radius: 4px;
            }
            .button:hover {
                background-color: #b8922e;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                ¡Tu turno ha sido ${state}!
            </div>
      <div class="body">
        <p>Hola,</p>
        <p>${message}</p>
        <p>Los datos de tu turno son los siguientes:</p>
        ${appointmentHtml}
        <p>Si tienes alguna consulta o necesitas realizar algún cambio, no dudes en contactarnos.</p>
        <a href="https://gym.com/contacto" class="button">Contáctanos</a>
      </div>
            <div class="footer">
                <p>&copy; 2024 Nicolas Sanetti Coiffeur. Todos los derechos reservados.</p>
                <p>Este correo es generado automáticamente, por favor no respondas a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
            `
        });
    } catch (error) {
        console.log(error)
    }

};

