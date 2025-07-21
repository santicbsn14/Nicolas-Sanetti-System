import mongoose, { Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { IdMongo } from 'typesMongoose';

const roleCollection = 'roles';
export interface Role{
    _id?: IdMongo,
    name: string,
    permissions: string[]
}
const RoleSchema = new Schema<Role>({
  name: { type: Schema.Types.String, index: true, required: true },
  permissions: [{ type: Schema.Types.String }]
});

RoleSchema.plugin(paginate);

export default mongoose.model<Role>(roleCollection, RoleSchema);