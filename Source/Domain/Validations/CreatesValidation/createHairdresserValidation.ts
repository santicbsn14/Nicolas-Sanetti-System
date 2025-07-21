import z from 'zod';
import idValidation from '../idValidation';

// Enum for State
const stateEnum = z.enum(['Disponible', 'No disponible', 'Vacaciones', 'Feriado']);

const limit_services = z.object(
    {
        day: z.number(),
        max: z.number()
    }
)
// DaySchedule schema


// Main schema for ProfessionalTimeSlots
const createHairdresserValidation = z.object({
  user_id: idValidation,
  services: z.array(idValidation),
  state: stateEnum.default('Disponible'),
  limit_services:z.array(limit_services)
});

export default createHairdresserValidation;
