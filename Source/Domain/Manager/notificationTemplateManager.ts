import { Criteria, IdMongo, Paginated } from "typesMongoose";
import container from "../../container";
import { NotificationTemplate } from "Source/Data/Models/notificationTemplateSchema.js";
import { mailForConfirmAppointment } from "Source/Services/mailing.js";
import { CreateNotificationDto } from "typesRequestDtos";
import idValidation from "../Validations/idValidation";
import createNotificationValidation from "../Validations/CreatesValidation/createNotificationValidation";
import { Appointment } from "Source/Data/Models/appointmentSchema";
import { renderTemplate } from "Source/Utils/renderTemplate";
import { isValidObjectId } from "mongoose";

class NotificationTemplateManager {
    private notificationTemplateRepository;
    private templateCache: Map<string, { 
        template: NotificationTemplate, 
        timestamp: number
    }>;
    private CACHE_DURATION = 1000 * 60 * 60;

    constructor() {
        this.notificationTemplateRepository = container.resolve('NotificationRepository');
        this.templateCache = new Map();
    }

    private getCachedTemplate(id: string): NotificationTemplate | null {
        const cached = this.templateCache.get(id);
        
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
            return cached.template;
        }
        
        if (cached) {
            this.templateCache.delete(id);
        }
        
        return null;
    }

    async getNotificationTemplateById(id: string | IdMongo): Promise<NotificationTemplate> {
        await idValidation.parseAsync(id)
        const cachedTemplate = this.getCachedTemplate(id as string);
        if (cachedTemplate) {
            return cachedTemplate;
        }

        const template = await this.notificationTemplateRepository.getNotificationTemplateById(id);
        
        if (template) {
            this.templateCache.set(id as string, {
                template,
                timestamp: Date.now()
            });
        }

        return template;
    }

    clearTemplateCache() {
        this.templateCache.clear();
    }

    async getAll(criteria: Criteria): Promise<Paginated<NotificationTemplate[]>>  {
      return await  this.notificationTemplateRepository.getAll(criteria);
    }

    async getNotificationByName(name: String): Promise<Paginated<NotificationTemplate>> {
      return await this.notificationTemplateRepository.getNotificationTemplateByName(name)
    }

    async createNotificationTemplate(data: CreateNotificationDto) {
        await createNotificationValidation.parseAsync(data)
        this.clearTemplateCache();
        return await this.notificationTemplateRepository.createNotificationTemplate(data);
    }

    async sendNotificationTemplate(
        notification: NotificationTemplate,
        state: string,
        clientEmail: string,
        appointment: Appointment
      ) {
      
        mailForConfirmAppointment(clientEmail, notification.name, state,notification.message, appointment);
      }
    async updateNotificationTemplate(id: string | IdMongo, data: NotificationTemplate) {
        await idValidation.parseAsync(id)
        this.templateCache.delete(id as string);
        return this.notificationTemplateRepository.updateNotificationTemplate(id, data);
    }

    async deleteNotificationTemplate(id: string | IdMongo) {
        await idValidation.parseAsync(id)
        this.templateCache.delete(id as string);
        return this.notificationTemplateRepository.deleteNotificationTemplate(id);
    }
}

export default NotificationTemplateManager;