import mongoose, { Schema, Document, PaginateModel, CallbackError } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Role} from './roleSchema'
import hairdresserSchema from './hairdresserSchema';
// import professionalSchema from './professionalSchema';
// import patientSchema from './patientSchema';

export interface IUser  {
  firstname: string;
  lastname: string;
  email: string;
  age: number;
  dni: number,
  phone: number,
  role: mongoose.Types.ObjectId | string | Role;
  password: string;
  _id?: mongoose.Types.ObjectId;
  fuid:string
}


const userSchema = new Schema<IUser>({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  age: { type: Number, required: true },
  dni: {type: Number, unique: true, required: true},
  role: { type: Schema.Types.ObjectId,index: true, ref: 'roles' },
  phone:{type:Number, required:true},
  password: { type: String, required: true },
  fuid:{type: String, required: true, immutable: true}
});

userSchema.plugin(paginate);
userSchema.pre('findOneAndDelete', async function (next) {
  const user = this;  // `this` es la query
  
  try {
    const doc = await user.model.findOne(this.getFilter());  // Obtener el documento que se está eliminando

    if (doc) {
      // Eliminar profesionales y pacientes asociados al user_id del usuario
      await hairdresserSchema.deleteMany({ user_id: doc._id });
    }

    next();
  } catch (error) {
    next(error as unknown as CallbackError)
  }
});
export interface UserModel extends PaginateModel<IUser> {}

export default mongoose.model<IUser, UserModel>('users', userSchema);
