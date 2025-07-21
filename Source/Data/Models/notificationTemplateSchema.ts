import { Dayjs } from 'dayjs';
import mongoose, { Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { IdMongo } from 'typesMongoose';

const notificationCollection = 'notification_template';
export interface NotificationTemplate{
    _id?: IdMongo,
    name: string,
    message: string,
    updatedAt?: Dayjs,
}
const Notification_TemplatesSchema = new Schema<NotificationTemplate>({
  name: { type: Schema.Types.String, index: true, required: true },
  message: { type: Schema.Types.String, required: true },
  updatedAt:{type: Schema.Types.Date}
});

Notification_TemplatesSchema.plugin(paginate);

export default mongoose.model<NotificationTemplate>(notificationCollection, Notification_TemplatesSchema);