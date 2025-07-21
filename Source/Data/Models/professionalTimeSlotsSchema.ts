import mongoose, { Schema, Document, PaginateModel } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Dayjs } from 'dayjs';
import { Hairdresser } from './hairdresserSchema';

export interface TimeSlot {
    start_time: Dayjs;
    end_time: Dayjs;
}

export interface DaySchedule {
    week_day: number; 
    time_slots: TimeSlot;
}

export interface ProfessionalTimeSlots {
    _id?: mongoose.Types.ObjectId;
    hairdresser_id: mongoose.Types.ObjectId | string | Hairdresser;
    schedule: DaySchedule[];
}

const professionalTimeSlotsSchema = new Schema<ProfessionalTimeSlots>({
    hairdresser_id: { type: Schema.Types.ObjectId, index: true, ref: 'hairdressers', required: true },
    schedule: [
        {
            week_day: { type: Number, min: 0, max: 6, required: true }, 
            time_slots: {
                start_time: { type: Date, required: true },
                end_time: { type: Date, required: true }
            }
        }
    ]
});
professionalTimeSlotsSchema.plugin(paginate);

export default mongoose.model<ProfessionalTimeSlots, PaginateModel<ProfessionalTimeSlots>>(
    'professional_time_slots', 
    professionalTimeSlotsSchema
);