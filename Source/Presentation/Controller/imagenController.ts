import { NextFunction, Request, Response } from 'express'
import ImagenManager from '../../Domain/Manager/imagenManager'

export const upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manager = new ImagenManager()
        res.status(201).json(await manager.upload(req.file))
    } catch (error) {
        next(error)
    }
}
