import { Router } from "express";
import { createUser, deleteOne, getAll, getByEmail, getById, update } from "../Controller/userController";
import authMiddleware from "../Middlewares/auth";
import authorization from "../Middlewares/authorization";

const userRouter = Router()
userRouter.get('/', getAll)
userRouter.get('/email', getByEmail)
userRouter.get('/:id',authMiddleware,authorization('GetUserById'), getById)
userRouter.post('/', createUser);
userRouter.put('/:id',update)
userRouter.delete('/:id', deleteOne)
export default userRouter