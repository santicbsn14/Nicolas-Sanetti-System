import z from 'zod';
import mongoose from 'mongoose';
import emailValidation from '../emailValidation';
import idValidation from '../idValidation';

const createClientValidation = z.object({
  firstname: z.string(),
  lastname:z.string(),
  email: z.string().email(),
  age: z.number(),
  phone:z.number(),
  dni: z.number(),
  appointments_history:z.array(idValidation).optional(),
  attachments: z.string().optional()
});

export default createClientValidation;
