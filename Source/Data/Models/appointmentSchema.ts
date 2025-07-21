import mongoose, { Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Dayjs } from 'dayjs';
import { Service } from './serviceSchema';
import { IClient } from './clientSchema';


export type appointmentState = 'Solicitado' | 'Confirmado' | 'Completado' | 'Cancelado' | 'Pendiente'
export interface Appointment {
    _id?: mongoose.Types.ObjectId,
    client_id: mongoose.Types.ObjectId | string | IClient ,
    hairdresser_id: mongoose.Types.ObjectId | string,
    date_time: Dayjs,
    state: appointmentState,
    service_id: mongoose.Types.ObjectId |  Service |string ;
    notes?: string[],
}

const appointmentSchema = new Schema<Appointment>({
    client_id: {type: Schema.Types.ObjectId, ref:'clients', required: true},
    hairdresser_id: {type: Schema.Types.ObjectId, ref:'hairdressers', required: true},
    date_time: {type: Schema.Types.Date, required:true},
    service_id:{type: Schema.Types.ObjectId, ref:'services', required: true},
    state: {type: Schema.Types.String, required: true, default:'Solicitado'},
})

appointmentSchema.plugin(paginate)

export default mongoose.model<Appointment>('appointments', appointmentSchema)