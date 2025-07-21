import { Router } from "express";
import { create, deleteOne, getAll, getById, update } from "../Controller/roleController";

const roleRouter: Router = Router()

roleRouter.get('/', getAll)
roleRouter.get('/:id', getById)
roleRouter.post('/', create);
roleRouter.put('/:id', update)
roleRouter.delete('/:id', deleteOne)
export default roleRouter