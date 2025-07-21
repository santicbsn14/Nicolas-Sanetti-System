import { Router } from "express";
import { createProfessionalTimeSlots, deleteOne, getAll, getById, getByPro, update } from "../Controller/professionalTimeSlotsController";
import authMiddleware from "../Middlewares/auth";
import authorization from "../Middlewares/authorization";

const professionalTimeSlotsRouter: Router = Router()

professionalTimeSlotsRouter.get('/', getAll)
professionalTimeSlotsRouter.get('/:id', getById)
professionalTimeSlotsRouter.get('/bypro/:idp',authMiddleware, authorization('GetProfessionalTimeSlotsByPro'), getByPro)
professionalTimeSlotsRouter.post('/',authMiddleware, authorization('CreateProfessionalTimeSlots'), createProfessionalTimeSlots);
professionalTimeSlotsRouter.put('/:id',authMiddleware, authorization('UpdateProfessionalTimeSlots'), update)
professionalTimeSlotsRouter.delete('/:id',authMiddleware, authorization('DeleteProfessionalTimeSlots'), deleteOne)
export default professionalTimeSlotsRouter