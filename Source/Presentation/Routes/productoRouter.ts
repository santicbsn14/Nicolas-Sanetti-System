import { Router } from 'express'
import { create, deleteOne, getAll, getById, reorder, update } from '../Controller/productoController'

// Se monta en /api/admin/productos, detrás de requireAdmin
const productoRouter: Router = Router()

productoRouter.get('/', getAll)
productoRouter.post('/reordenar', reorder)
productoRouter.get('/:id', getById)
productoRouter.post('/', create)
productoRouter.patch('/:id', update)
productoRouter.delete('/:id', deleteOne)

export default productoRouter
