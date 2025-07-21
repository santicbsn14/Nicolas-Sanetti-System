// Imports locales
import admin from 'firebase-admin';
import AppFactory from './Presentation/Factories/appFactory.js';
import { readFileSync } from 'fs';
import path from 'path';

// Cargar las credenciales desde el archivo JSON
const serviceAccountPath = path.resolve('firebase.key.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = AppFactory.create(process.env.APPLICATION);

app.start();

export default app;
