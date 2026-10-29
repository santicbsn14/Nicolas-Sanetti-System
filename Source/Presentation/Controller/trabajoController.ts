import { NextFunction, Request, Response } from 'express'
import TrabajoManager from '../../Domain/Manager/trabajoManager'

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manager = new TrabajoManager()
        res.status(200).json(await manager.getAll())
    } catch (error) {
        next(error)
    }
}

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manager = new TrabajoManager()
        res.status(200).json(await manager.getById(req.params.id))
    } catch (error) {
        next(error)
    }
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manager = new TrabajoManager()
        res.status(201).json(await manager.create(req.body))
    } catch (error) {
        next(error)
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manager = new TrabajoManager()
        res.status(200).json(await manager.update(req.params.id, req.body))
    } catch (error) {
        next(error)
    }
}

export const reorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manager = new TrabajoManager()
        res.status(200).json(await manager.reorder(req.body))
    } catch (error) {
        next(error)
    }
}

export const deleteOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manager = new TrabajoManager()
        await manager.delete(req.params.id)
        res.status(204).end()
    } catch (error) {
        next(error)
    }
}
