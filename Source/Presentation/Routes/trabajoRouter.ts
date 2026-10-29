import { Router } from 'express'
import { create, deleteOne, getAll, getById, reorder, update } from '../Controller/trabajoController'

// Se monta en /api/admin/trabajos, detrás de requireAdmin
const trabajoRouter: Router = Router()

trabajoRouter.get('/', getAll)
trabajoRouter.post('/reordenar', reorder)
trabajoRouter.get('/:id', getById)
trabajoRouter.post('/', create)
trabajoRouter.patch('/:id', update)
trabajoRouter.delete('/:id', deleteOne)

export default trabajoRouter
