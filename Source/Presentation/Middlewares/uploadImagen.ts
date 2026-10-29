import { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { HttpError } from '../../Utils/httpError'

export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES, files: 1 },
    fileFilter: (req, file, cb) => {
        if (TIPOS_IMAGEN.includes(file.mimetype)) return cb(null, true)
        cb(new HttpError(400, 'Formato no permitido. Usá JPG, PNG o WEBP'))
    },
}).single('imagen')

// Envuelve multer para traducir sus errores a status HTTP
const uploadImagen = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (error: unknown) => {
        if (!error) return next()
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') return next(new HttpError(413, 'La imagen supera los 10 MB'))
            return next(new HttpError(400, `Archivo inválido: mandá una sola imagen en el campo "imagen" (${error.code})`))
        }
        next(error)
    })
}

export default uploadImagen
