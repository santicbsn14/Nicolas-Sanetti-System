import { NextFunction, Response } from "express";
import { Hairdresser } from "../../Data/Models/hairdresserSchema";
import HairdresserManager from "../../Domain/Manager/hairdresserManager";
import { IdMongo, Criteria } from "typesMongoose";
import { CreateHairdresserDto } from "typesRequestDtos";



export const createHairdresser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const manager = new HairdresserManager();
        
        if (!req.body) {
            throw new Error('Request body is empty');
        }
        const body: CreateHairdresserDto = req.body
        const createdHairdresser = await manager.createHairdresser(body);
        
        res.status(201).json(createdHairdresser);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
            const manager = new HairdresserManager()
            const { limit, page }: Criteria = req.query;
            const data = await manager.getAll({ limit, page });
            res.send({ status: 'success', hairdressers: data.docs, ...data, docs: undefined })
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
        const manager = new HairdresserManager()
        let id : IdMongo = req.params.id as unknown as IdMongo
        res.status(200).json(await manager.getHairdresserById(id))
        }
        catch(error)
        {
        console.log(error)
        next(error)
        }
}


export const update = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
        const manager = new HairdresserManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        let obj : Hairdresser = req.body as unknown as Hairdresser
        res.status(201).json(await manager.updateHairdresser(obj, id))
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
        const manager = new HairdresserManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        res.status(201).json(await manager.deleteHairdresser(id))
        }
        catch(error)
        {
           next(error)
        }
}