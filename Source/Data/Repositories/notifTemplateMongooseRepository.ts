import mongoose, { PaginateResult } from 'mongoose';
import notificationTemplateSchema, {NotificationTemplate} from '../Models/notificationTemplateSchema';
import { Paginated, Criteria, IdMongo } from '../../Utils/Types/typesMongoose';

interface INotificationTemplateRepository{
    getAll: (criteria :Criteria)=> Promise<Paginated<NotificationTemplate>| null>,
    createNotificationTemplate: (notificationTemplate: NotificationTemplate)=> Promise<NotificationTemplate | null>,
    getNotificationTemplateById: (notificationTemplateId: IdMongo) => Promise<NotificationTemplate | null>,
    getNotificationTemplateByName: (nameNotificationTemplate: string) => Promise<NotificationTemplate | null>,
    updateNotificationTemplate: (notificationTemplateId:IdMongo, body: Partial<NotificationTemplate>) => Promise<NotificationTemplate | null>,
    deleteNotificationTemplate: (notificationTemplateId: IdMongo) => Promise<string>,
}

class NotificationTemplateRepository implements INotificationTemplateRepository{
    async getAll(criteria: Criteria):Promise<Paginated<NotificationTemplate>| null> {
      let { limit = 30, page = 1 } = criteria;
      //@ts-ignore se vera luego...
      const notificationTemplateDocuments:PaginateResult<NotificationTemplate> = await notificationTemplateSchema.paginate({}, { limit, page });
  
      if(!notificationTemplateDocuments) throw new Error('NotificationTemplatess could not be accessed')
      if(!notificationTemplateDocuments.page) notificationTemplateDocuments.page = 1
  
      const mappedNotificationTemplate = notificationTemplateDocuments.docs.map((notificationTemplate) => {
        return {
            _id: notificationTemplate._id,
            name: notificationTemplate.name,
            message: notificationTemplate.message,
            updatedAt: notificationTemplate.updatedAt,
        }
      })
      return {
        docs: mappedNotificationTemplate ,
        totalDocs: notificationTemplateDocuments.totalDocs,
        limit: notificationTemplateDocuments.limit,
        totalPages:notificationTemplateDocuments.totalPages,
        pagingCounter: notificationTemplateDocuments.pagingCounter,
        hasPrevPage: notificationTemplateDocuments.hasPrevPage,
        hasNextPage: notificationTemplateDocuments.hasNextPage,
        page: notificationTemplateDocuments.page,
        prevPage: notificationTemplateDocuments.prevPage,
        nextPage: notificationTemplateDocuments.nextPage,
      };
    }
    async createNotificationTemplate(body: NotificationTemplate):Promise<NotificationTemplate | null>{
      const newNotificationTemplate :NotificationTemplate = await notificationTemplateSchema.create(body)
      if(!newNotificationTemplate) throw new Error('A problem occurred when the NotificationTemplate was created')
        return {
            _id: newNotificationTemplate._id,
            name: newNotificationTemplate.name,
            message: newNotificationTemplate.message,
            updatedAt: newNotificationTemplate.updatedAt,
        }
    }
    async getNotificationTemplateById(id: IdMongo):Promise<NotificationTemplate|null>{
  
      const notificationTemplate = await notificationTemplateSchema.findById(id)
      if(!notificationTemplate) throw new Error('NotificationTemplate could not found')
        return {
            _id: notificationTemplate._id,
            name: notificationTemplate.name,
            message: notificationTemplate.message,
            updatedAt: notificationTemplate.updatedAt,
        }
    }
    async getNotificationTemplateByName(name: string): Promise<NotificationTemplate |null> {
      const notificationTemplate  = await notificationTemplateSchema.findOne({name: name})
      if(!notificationTemplate) return null
      return notificationTemplate
    }
    async updateNotificationTemplate(id: IdMongo, body :Partial<NotificationTemplate>):Promise<NotificationTemplate|null>{
      const updatedNotificationTemplate = await notificationTemplateSchema.findByIdAndUpdate(id, body, 
        { new: true, runValidators: true })
      if(!updatedNotificationTemplate) throw new Error('A problem occurred when the NotificationTemplate was updated')
      
        return {
            _id: updatedNotificationTemplate._id,
            name: updatedNotificationTemplate.name,
            message: updatedNotificationTemplate.message,
            updatedAt: updatedNotificationTemplate.updatedAt,
        }
    }
    async deleteNotificationTemplate(id:IdMongo):Promise<string>{
      const notificationTemplateDeleted = await notificationTemplateSchema.findByIdAndDelete(id)
      if(!notificationTemplateDeleted) throw new Error('A problem occurred when the NotificationTemplate was deleted')
        return `NotificationTemplate with ID ${id} has been successfully deleted.`;
    }
  }
  export default NotificationTemplateRepository