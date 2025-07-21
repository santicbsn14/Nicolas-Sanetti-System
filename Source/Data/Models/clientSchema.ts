import mongoose, { Schema, Document, PaginateModel, CallbackError } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Appointment } from './appointmentSchema';
// import professionalSchema from './professionalSchema';
// import patientSchema from './patientSchema';

export interface IClient  {
  firstname: string;
  lastname: string;
  email: string;
  age: number;
  dni: number,
  phone: number,
  appointments_history?:Appointment[] | mongoose.Types.ObjectId[] | string[];
  next_appointment?: Appointment | mongoose.Types.ObjectId | string;
  _id?: mongoose.Types.ObjectId
}


const clientSchema = new Schema<IClient>({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  age: { type: Number, required: true },
  dni: {type: Number, unique: true, required: true},
  appointments_history:[{type: Schema.Types.ObjectId, ref:'appointments' }],
  next_appointment:{type: Schema.Types.ObjectId, ref:'appointments' },
  phone:{type:Number, required:true},
});

clientSchema.plugin(paginate);
export interface ClientModel extends PaginateModel<IClient> {}

export default mongoose.model<IClient, ClientModel>('clients', clientSchema);
