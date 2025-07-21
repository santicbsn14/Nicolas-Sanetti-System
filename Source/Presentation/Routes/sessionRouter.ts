import { Router } from "express";
import { signup, updatedUser } from "../Controller/sessionController";

const sessionRouter: Router = Router()

sessionRouter.post('/signup', signup)
sessionRouter.put('/:id', updatedUser)
export default sessionRouter