import { Router } from "express";
import { createHairdresser, deleteOne, getAll, getById, update } from "../Controller/hairdresserController";
import authorization from "../Middlewares/authorization";
import authMiddleware from "../Middlewares/auth";

const hairdresserRouter: Router = Router()

hairdresserRouter.get('/', getAll)
hairdresserRouter.get('/:id',authMiddleware, authorization('GetUserById'), getById)
hairdresserRouter.post('/',authMiddleware, authorization('CreateHairdresser'), createHairdresser);
hairdresserRouter.put('/:id',authMiddleware, authorization('UpdateUser'), update)
hairdresserRouter.delete('/:id',authMiddleware, authorization('DeleteUser'), deleteOne)
export default hairdresserRouter