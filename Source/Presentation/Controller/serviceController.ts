import { NextFunction, Response } from "express";
import { Service } from "../../Data/Models/serviceSchema";
import ServiceManager from "../../Domain/Manager/serviceManager";
import { IdMongo, Criteria } from "typesMongoose";
import {CreateServiceDto } from "typesRequestDtos";



export const createService = async (req:CustomRequest, res: Response, next: NextFunction) => {
    try {
        const manager = new ServiceManager();
        
        if (!req.body) {
            throw new Error('Request body is empty');
        }
        const body: CreateServiceDto = req.body as unknown as CreateServiceDto
        const createdService = await manager.createService(body);
        
        res.status(201).json(createdService);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
            const manager = new ServiceManager()
            const { limit, page }: Criteria = req.query;
            const data = await manager.getAll({ limit, page });
            res.status(201).send({ status: 'success', services: data.docs, ...data, docs: undefined })
        }
        catch(error)
        {
        next(error)
        }
}
        
export const getById =  async (req: CustomRequest, res: Response, next: NextFunction)=>
{
        try
        {
        const manager = new ServiceManager()
        let id : IdMongo = req.params.id as unknown as IdMongo
        res.status(200).json(await manager.getServiceById(id))
        }
        catch(error)
        {
        next(error)
        }
}

export const update = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
        const manager = new ServiceManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        let obj : Service = req.body as unknown as Service
        res.status(201).json(await manager.updateService(obj, id))
        }
        catch(error)
        {
           next(error)
        }
}
        
export const deleteOne = async (req: CustomRequest, res: Response, next: NextFunction)=>
{
        try
        {
        const manager = new ServiceManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        res.status(201).json(await manager.deleteService(id))
        }
        catch(error)
        {
           next(error)
        }
}