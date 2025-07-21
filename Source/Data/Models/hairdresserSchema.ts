import mongoose, { Schema, Document } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Service } from './serviceSchema';
export type limitServices =
    {day: number,
     max:number}

export interface Hairdresser {
    user_id: mongoose.Types.ObjectId | string,
    _id?: mongoose.Types.ObjectId,
    services: Service[] | mongoose.Types.ObjectId | string,
    state: 'Disponible' | 'No disponible' | 'Vacaciones' | 'Feriado' ;
    limit_services: limitServices[]
}

const hairdresserSchema = new Schema<Hairdresser>({
    user_id: {type: Schema.Types.ObjectId, ref:'users', index: true, required:true},
    services:[{type: Schema.Types.ObjectId,ref:'services', required: true}],
    state: {type: Schema.Types.String, required: true},
    limit_services:[
        {
            day: { type: Number, min: 0,}, 
            max: { type: Number, min: 0}
        }
    ]
})
hairdresserSchema.plugin(paginate)

export default mongoose.model<Hairdresser>('hairdressers', hairdresserSchema)