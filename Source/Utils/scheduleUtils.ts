import { DaySchedule, TimeSlot } from 'Source/Data/Models/professionalTimeSlotsSchema';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import utc from 'dayjs/plugin/utc.js'; 
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

export function isAvailable(
    professionalSchedule: DaySchedule[],
    clientRequest: Dayjs 
): boolean {
    const systemTimezone = 'America/Buenos_Aires';
    
    function convertToSchedule(date: Date | Dayjs): DaySchedule {
        const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);
        
        const weekDay = dayjsDate.day();
        
        const timeSlot: TimeSlot = {
            start_time: dayjsDate,
            end_time: dayjsDate.add(1, 'hour')
        };
        
        const schedule: DaySchedule = {
            week_day: weekDay,
            time_slots: timeSlot
        };
        
        return schedule;
    }
    let convertDateClient : DaySchedule = convertToSchedule(clientRequest)
    
    const requests = Array.isArray(convertDateClient) ? convertDateClient : [convertDateClient];

    return requests.every((requestedDay: DaySchedule) => {
        // Buscamos si el profesional trabaja en el día solicitado
        const matchingDay = professionalSchedule.find(
            (profDay: DaySchedule) => profDay.week_day === requestedDay.week_day
        );

        if (!matchingDay) return false;

        // Obtenemos los slots de tiempo tanto del profesional como del paciente
        const reqSlot = requestedDay.time_slots;
        const profSlot = matchingDay.time_slots;

        const profStartLocal = dayjs(profSlot.start_time).tz(systemTimezone)
        const profEndLocal = dayjs(profSlot.end_time).tz(systemTimezone)
        const reqSlotStart = dayjs(reqSlot.start_time).tz(systemTimezone)
        const reqSlotEnd = dayjs(reqSlot.end_time).tz(systemTimezone)
                // Agrega logs para verificar los valores
        console.log("Professional Start:", profStartLocal);
        console.log("Professional End:", profEndLocal);
        console.log("Request Start:", reqSlotStart);
        console.log("Request End:", reqSlotEnd);
        const isStartTimeValid = reqSlotStart.hour() > profStartLocal.hour() || 
                                 (reqSlotStart.hour() === profStartLocal.hour() && reqSlotStart.minute() >= profStartLocal.minute());

        const isEndTimeValid = reqSlotEnd.hour() < profEndLocal.hour() || 
                               (reqSlotEnd.hour() === profEndLocal.hour() && reqSlotEnd.minute() <= profEndLocal.minute());

        return isStartTimeValid && isEndTimeValid;
    });
}
