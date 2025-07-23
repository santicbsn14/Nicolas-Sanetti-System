import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import dotenv from 'dotenv';
import customLogger from '../../Services/logger.js';
dotenv.config();
import cron from 'node-cron';
import DbFactory from '../../Data/Factories/dbFactory.js';
import appointmentRouter from '../Routes/appointmentRouter.js';
import hairdresserRouter from '../Routes/hairdresserRouter.js';
import sessionRouter from '../Routes/sessionRouter.js';
import userRouter from '../Routes/userRouter.js';
import roleRouter from '../Routes/roleRouter.js';
import clientRouter from '../Routes/clientRouter.js';
import serviceRouter from '../Routes/serviceRouter.js';
import notificationTemplateRouter from '../Routes/notificationTemplateRouter.js';
import dailyHourAvailabilityRouter from '../Routes/dailyHourARouter.js';
import professionalTimeSlotsRouter from '../Routes/professionalTimeSlotsRouter.js';
import errorHandler from '../Middlewares/errorHandler.js';
import AppointmentManager from '../../Domain/Manager/appointmentManager.js';


class AppExpress {
    private app: express.Express;
    private server: import('http').Server | null = null;

    constructor() {
        // Manejo de errores no capturados
        process.on('uncaughtException', (err) => {
            customLogger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
            process.exit(1);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            customLogger.error('Unhandled Rejection', { reason });
        });

        this.app = express();
        this.init();
        this.build();
        this.connectDb();
    }

    // Inicializar middlewares
    init() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors({
  origin: ['http://localhost:5173', 'https://nicolas-sanetti-front.vercel.app/'], // o '*', pero solo en dev
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // si usás cookies o headers especiales
}));
    }

    // Conectar base de datos
    async connectDb() {
        try {
            const db = DbFactory.create(process.env.DB);
            await db.init(process.env.DB_URI);
            console.log('Conexión a la base de datos exitosa');
                    const appointmentManager = new AppointmentManager();

        // Ejecuta todos los días a las 8:00 AM
        cron.schedule('0 8 * * *', async () => {
            try {
                console.log('[CRON] Enviando recordatorios de turnos...');
                await appointmentManager.notifyAppointmentsOfTheDay();
                console.log('[CRON] Recordatorios enviados con éxito.');
            } catch (err) {
                console.error('[CRON] Error al enviar recordatorios:', err);
            }
        });
        } catch (error) {
            if(error instanceof Error)
            customLogger.error(`Error al conectar con la base de datos: ${error.message}`, { stack: error.stack });
            process.exit(1);  
        }
    }

    // Callback para devolver la aplicación
    callback() {
        return this.app;
    }

    // Cerrar el servidor
    close() {
        if (this.server) {
            this.server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        }
    }

    // Definir rutas
    build() {
        this.app.use('/api/appointments', appointmentRouter)
        this.app.use('/api/hairdresser', hairdresserRouter)
        this.app.use('/api/session', sessionRouter)
        this.app.use('/api/users', userRouter)
        this.app.use('/api/roles', roleRouter);
        this.app.use('/api/clients', clientRouter);
        this.app.use('/api/service', serviceRouter)
        this.app.use('/api/notificationTemplate', notificationTemplateRouter)
        this.app.use('/api/dailyHourAvailability', dailyHourAvailabilityRouter)
        this.app.use('/api/professionalTimeSlots', professionalTimeSlotsRouter)
        this.app.use(errorHandler)
    }

    // Solo escuchamos en un puerto si NO estamos en Vercel
    listen() {
        try {
            if (!process.env.VERCEL) {
                console.log('aca entramos')
                this.server = this.app.listen(process.env.PORT, () => {
                    console.log(`Escuchando en puertoo ${process.env.PORT}`);
                });
            }
        } catch (error) {
            console.log(error)
        }

    }


    start() {
        if (!process.env.VERCEL) {
            this.server = this.app.listen(process.env.PORT, () => {
                console.log(`Escuchando en puerto ${process.env.PORT}`);
            });
        }
    }
}

export default AppExpress;

const appExpressInstance = new AppExpress();
export const app = appExpressInstance.callback();