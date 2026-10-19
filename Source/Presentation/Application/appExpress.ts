import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import dotenv from 'dotenv';
import customLogger from '../../Services/logger.js';
dotenv.config();
import DbFactory from '../../Data/Factories/dbFactory.js';
import errorHandler from '../Middlewares/errorHandler.js';

const DEFAULT_CORS_ORIGINS = 'http://localhost:5173,https://nicolas-sanetti-front.vercel.app';


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
        const corsOrigins = (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS)
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean);

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors({
  origin: corsOrigins,
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

    // Routers del sistema de turnos desmontados (ver tag v1-con-turnos). No volver a montarlos sin antes protegerlos con auth: varias rutas eran públicas y permitían escalar a Admin.
    build() {
        this.app.get('/api/health', (req, res) => {
            res.status(200).json({ status: 'ok' });
        });

        this.app.use('/api', (req, res) => {
            res.status(404).json({ message: 'Not found' });
        });

        this.app.use(errorHandler)
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
