import { NextFunction, Response } from "express";
import { NotificationTemplate } from "../../Data/Models/notificationTemplateSchema";
import NotificationTemplateManager from "../../Domain/Manager/notificationTemplateManager";
import { IdMongo, Criteria, Paginated } from "typesMongoose";
import { CreateNotificationDto } from "typesRequestDtos";


export const createNotificationTemplate = async (req: CustomRequest<CreateNotificationDto>, res: Response, next: NextFunction) => {
    try {
        const manager = new NotificationTemplateManager();
        
        if (!req.body) {
            throw new Error('Request body is empty');
        }

        const notificationTemplateData: CreateNotificationDto = req.body;
        const createdNotificationTemplate = await manager.createNotificationTemplate(notificationTemplateData);
        
        res.status(201).json(createdNotificationTemplate);
    } catch (error) {
        next(error);
    }
};
export const getAll = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
            const manager = new NotificationTemplateManager()
            const { limit, page }: Criteria = req.query;
            const data: Paginated<NotificationTemplate[]> = await manager.getAll({ limit, page });
            res.send({ status: 'success', notificationTemplate: data.docs, ...data, docs: undefined })
        }
        catch(error)
        {
        next(error)
        }
}
        
export const getById =  async (req: CustomRequest, res: Response, next: NextFunction)=>
{
        try
        {
        const manager = new NotificationTemplateManager()
        let id : IdMongo = req.params.id as unknown as IdMongo
        res.status(200).json(await manager.getNotificationTemplateById(id))
        }
        catch(error)
        {
        next(error)
        }
}

export const update = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
        const manager = new NotificationTemplateManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        let obj : NotificationTemplate = req.body as unknown as NotificationTemplate
        res.status(201).json(await manager.updateNotificationTemplate(id, obj))
        }
        catch(error)
        {
           next(error)
        }
}
        
export const deleteOne = async (req: CustomRequest, res: Response, next: NextFunction)=>
{
        try
        {
        const manager = new NotificationTemplateManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        res.status(201).json(await manager.deleteNotificationTemplate(id))
        }
        catch(error)
        {
           next(error)
        }
}