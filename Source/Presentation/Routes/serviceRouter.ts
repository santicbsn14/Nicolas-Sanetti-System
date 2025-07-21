import { Router } from "express";
import { createService, deleteOne, getAll, getById, update } from "../Controller/serviceController";
import authMiddleware from "../Middlewares/auth";
import authorization from "../Middlewares/authorization";

const serviceRouter: Router = Router()

serviceRouter.get('/', getAll)
serviceRouter.get('/:id',authMiddleware, authorization('GetServiceById'), getById)
serviceRouter.post('/',authMiddleware, authorization('CreateService'), createService);
serviceRouter.put('/:id',authMiddleware, authorization('UpdateService'), update);
serviceRouter.delete('/:id',authMiddleware, authorization('DeleteService'), deleteOne)
export default serviceRouter
