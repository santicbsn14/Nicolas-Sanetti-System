import mongoose, { ConnectOptions, Mongoose } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class DbMongoose {
    private connection: Mongoose | null = null;

    async init(): Promise<void> {
        try {
            this.connection = await mongoose.connect(process.env.DB_URI as string);
        } catch (error) {
            throw new Error(`Error en la conexión a la base de datos: ${error}`);
        }
    }

    async close(): Promise<void> {
        if (this.connection) {
            await this.connection.disconnect();
        }
    }

    async drop(): Promise<void> {
        if (this.connection && this.connection.connection && this.connection.connection.db) {
            await this.connection.connection.db.dropDatabase();
        } else {
            throw new Error("Database connection is not properly initialized.");
        }
    }
}

export default DbMongoose;