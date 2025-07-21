import mongoose from 'mongoose'
import z from 'zod'
import idValidation from '../idValidation'

const createNotificationValidation= z.object(
    {
        name: z.string(),
        message:z.string(),
        updatedAt: z.date().optional(),
    }
)
export default createNotificationValidation