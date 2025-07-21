import { NextFunction, Response } from "express";
import { ProfessionalTimeSlots } from "../../Data/Models/professionalTimeSlotsSchema";
import ProfessionalTimeSlotsManager from "../../Domain/Manager/proTimeSlotsManager";
import { IdMongo, Criteria } from "typesMongoose";
import { CreateProfessionalTimeSlotsDto } from "typesRequestDtos";


export const createProfessionalTimeSlots = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const manager = new ProfessionalTimeSlotsManager();
        
        if (!req.body) {
            throw new Error('Request body is empty');
        }

        const professionalTimeSlotsData: CreateProfessionalTimeSlotsDto = req.body;
        const createdProfessionalTimeSlots = await manager.createProfessionalTimeSlots(professionalTimeSlotsData);
        
        res.status(201).json(createdProfessionalTimeSlots);
    } catch (error) {
        next(error);
    }
};
export const getAll = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
            const manager = new ProfessionalTimeSlotsManager()
            const { limit, page }: Criteria = req.query;
            const data = await manager.getAll({ limit, page });
            res.send({ status: 'success', professionalTimeSlots: data.docs, ...data, docs: undefined })
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
        const manager = new ProfessionalTimeSlotsManager()
        let id : IdMongo = req.params.id as unknown as IdMongo
        res.status(200).json(await manager.getProfessionalTimeSlotsById(id))
        }
        catch(error)
        {
        next(error)
        }
}

export const getByPro =  async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
            try
            {
            const manager = new ProfessionalTimeSlotsManager()
            let id : IdMongo = req.params.idp as unknown as IdMongo
            res.status(200).json(await manager.getProfessionalTimeSlotsByPro(id))
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
        const manager = new ProfessionalTimeSlotsManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        let obj : ProfessionalTimeSlots = req.body as unknown as ProfessionalTimeSlots
        res.status(201).json(await manager.updateProfessionalTimeSlots(id, obj))
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
        const manager = new ProfessionalTimeSlotsManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        res.status(201).json(await manager.deleteProfessionalTimeSlots(id))
        }
        catch(error)
        {
           next(error)
        }
}