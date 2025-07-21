import mongoose from 'mongoose'
import z from 'zod'
import idValidation from '../idValidation'
import dayjs, { Dayjs } from 'dayjs';

const hourlySlotSchema = z.object({
    hour: z.number().int().min(0).max(23),
    max_sessions: z.number().int().min(0),
    current_sessions: z.number().int().min(0),
});
const createDHAValidation= z.object(
    {
        hairdresser_id: idValidation,
        hourly_slots:z.array(hourlySlotSchema),
        date: z.custom((val) => dayjs.isDayjs(val), {
            message: "End time must be a dayjs object",
          }),
    }
)
export default createDHAValidation