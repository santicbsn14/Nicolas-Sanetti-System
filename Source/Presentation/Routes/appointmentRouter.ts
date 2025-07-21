import { Router } from "express";
import { createAppointmentByClient, createAppointmentByHairdresser, deleteAppointment, getAll, getAppointmentById, updateAppointment } from "../Controller/appointmentController";
import authorization from "../Middlewares/authorization";
import authMiddleware from "../Middlewares/auth";

const appointmentRouter: Router = Router()

appointmentRouter.get('/', getAll)
appointmentRouter.get('/:id', getAppointmentById)
appointmentRouter.post('/byclient', createAppointmentByClient)
appointmentRouter.post('/byhairdresser', authMiddleware, authorization('CreateAppointments'),  createAppointmentByHairdresser);
appointmentRouter.put('/:id',   updateAppointment)
appointmentRouter.delete('/:id', deleteAppointment)
export default appointmentRouter