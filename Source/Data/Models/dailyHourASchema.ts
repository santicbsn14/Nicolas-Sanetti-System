import { Dayjs } from 'dayjs';
import mongoose,{Schema} from 'mongoose';
import paginate from 'mongoose-paginate-v2';
export interface HourlySlot {
    hour: number; // 0-23
    max_sessions: number;
    current_sessions: number;
}

export interface DailyHourAvailability {
    _id?: mongoose.Types.ObjectId;
    hairdresser_id: mongoose.Types.ObjectId | string;
    date: Dayjs;
    hourly_slots: HourlySlot[];
}
const dailyHourAvailabilitySchema = new Schema<DailyHourAvailability>({
    hairdresser_id: { type: Schema.Types.ObjectId, ref: 'hairdressers', required: true },
    date: { type: Date, required: true, index: true }, 
    hourly_slots: [{
        hour: { type: Number, required: true, min: 0, max: 23 },
        max_sessions: { type: Number, required: true, min: 1 },
        current_sessions: { type: Number, default: 0, min: 0 }
    }]
});
dailyHourAvailabilitySchema.plugin(paginate)
export default mongoose.model<DailyHourAvailability>('dayly_hour_availability', dailyHourAvailabilitySchema )