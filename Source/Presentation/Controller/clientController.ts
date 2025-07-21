import { NextFunction, Response } from "express";
import { IClient } from "../../Data/Models/clientSchema";
import ClientManager from "../../Domain/Manager/clientManager";
import { IdMongo, Criteria } from "typesMongoose";
import { AuthenticatedRequest, CreateClientDto } from "typesRequestDtos";



export const createClient = async (req:CustomRequest, res: Response, next: NextFunction) => {
    try {
        const manager = new ClientManager();
        
        if (!req.body) {
            throw new Error('Request body is empty');
        }
        const body: CreateClientDto = req.body as unknown as CreateClientDto
        const createdClient = await manager.createClient(body);
        
        res.status(201).json(createdClient);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
            const manager = new ClientManager()
            const { limit, page }: Criteria = req.query;
            const data = await manager.getAll({ limit, page });
            res.status(201).send({ status: 'success', clients: data.docs, ...data, docs: undefined })
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
        const manager = new ClientManager()
        let id : IdMongo = req.params.id as unknown as IdMongo
        res.status(200).json(await manager.getClientById(id))
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
        const manager = new ClientManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        let obj : IClient = req.body as unknown as IClient
        res.status(201).json(await manager.updateClient(obj, id))
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
        const manager = new ClientManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        res.status(201).json(await manager.deleteClient(id))
        }
        catch(error)
        {
           next(error)
        }
}