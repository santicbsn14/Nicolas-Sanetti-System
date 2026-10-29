import { NextFunction, Request, Response } from 'express'
import { getAuth, DecodedIdToken } from 'firebase-admin/auth'
import customLogger from '../../Services/logger'

// Admin = usuario de Firebase con custom claim `admin: true` (se da con scripts/set-admin.mjs).
// No usa los roles ni los usuarios de Mongo.
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const header = req.headers.authorization ?? ''
        const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
        if (!token) {
            res.status(401).json({ message: 'No autenticado' })
            return
        }

        let decoded: DecodedIdToken
        try {
            decoded = await getAuth().verifyIdToken(token)
        } catch (error) {
            customLogger.warn(`401 requireAdmin - ${error instanceof Error ? error.message : error}`, { route: req.path })
            res.status(401).json({ message: 'Sesión inválida o vencida' })
            return
        }

        if (decoded.admin !== true) {
            res.status(403).json({ message: 'Sin permisos de administrador' })
            return
        }

        req.admin = { uid: decoded.uid, email: decoded.email }
    } catch (error) {
        customLogger.error(`500 requireAdmin - ${error instanceof Error ? error.message : error}`, { route: req.path })
        if (!res.headersSent) res.status(500).json({ message: 'Ocurrió un error' })
        return
    }
    next()
}

export default requireAdmin
