import { Router } from "express";
import { createNotificationTemplate, deleteOne, getAll, getById, update } from "../Controller/notificationTemplateController";

const notificationTemplateRouter: Router = Router()

notificationTemplateRouter.get('/', getAll)
notificationTemplateRouter.get('/:id', getById)
notificationTemplateRouter.post('/', createNotificationTemplate);
notificationTemplateRouter.put('/:id', update)
notificationTemplateRouter.delete('/:id', deleteOne)
export default notificationTemplateRouter
