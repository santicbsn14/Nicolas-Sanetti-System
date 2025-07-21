import z from 'zod';
import idValidation from '../idValidation.js';
import dayjs from 'dayjs';

// TimeSlot schema que acepta strings y los transforma a dayjs
const timeSlotSchema = z.object({
    start_time: z.string()
        .refine((val) => dayjs(val).isValid(), {
            message: "Start time must be a valid date string",
        })
        .transform((val) => dayjs(val)),
    end_time: z.string()
        .refine((val) => dayjs(val).isValid(), {
            message: "End time must be a valid date string",
        })
        .transform((val) => dayjs(val)),
});

// DaySchedule schema
const dayScheduleSchema = z.object({
    week_day: z.number().min(0).max(6), // Agregar validación de rango
    time_slots: timeSlotSchema,
});

// Main schema
const createProfessionalTimeSlotsValidation = z.object({
    hairdresser_id: idValidation,
    schedule: z.array(dayScheduleSchema),
});

export default createProfessionalTimeSlotsValidation;