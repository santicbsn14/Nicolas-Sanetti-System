import { Router } from "express";
import { createClient, deleteOne, getAll, getById, update } from "../Controller/clientController";

const clientRouter: Router = Router()

clientRouter.get('/', getAll)
clientRouter.get('/:id', getById)
clientRouter.post('/', createClient);
clientRouter.put('/:id', update)
clientRouter.delete('/:id', deleteOne)
export default clientRouter