import mongoose, { Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Dayjs } from 'dayjs';


export interface Service{
    _id?: mongoose.Types.ObjectId,
    name:  string,
    price: number,
    enabled:boolean,
    duration: number,
    description:string,
    images_galery: string[],
    discount?: string,
    limit?: boolean,
    deadline_time?:Dayjs
}

const serviceSchema = new Schema<Service>({
    name: {type: Schema.Types.String,index: true, required: true},
    price: {type: Schema.Types.Number,  required: true},
    enabled: {type: Schema.Types.Boolean, required:true},
    duration:{type: Schema.Types.Number,  required: true},
    description:{type: Schema.Types.String, required: true},
    images_galery:[{type: Schema.Types.String, required: true}],
    discount: {type: Schema.Types.String},
    limit: {type: Schema.Types.Boolean},
    deadline_time:{type: Schema.Types.Date}
})

serviceSchema.plugin(paginate)

export default mongoose.model<Service>('services', serviceSchema)