import { Router } from 'express'
import { upload } from '../Controller/imagenController'
import uploadImagen from '../Middlewares/uploadImagen'

// Se monta en /api/admin/imagenes, detrás de requireAdmin
const imagenRouter: Router = Router()

imagenRouter.post('/', uploadImagen, upload)

export default imagenRouter
