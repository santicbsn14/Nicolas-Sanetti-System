import { NextFunction, Response } from "express";
import { Appointment } from "../../Data/Models/appointmentSchema";
import AppointmentManager from "../../Domain/Manager/appointmentManager";
import { IdMongo, Criteria } from "typesMongoose";
import { CreateAppointmentDto } from "typesRequestDtos";



export const createAppointmentByClient = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const manager = new AppointmentManager();
        
        if (!req.body) {
            throw new Error('Request body is empty');
        }
        
        const appointmentData: CreateAppointmentDto = req.body;
        const createdAppointment = await manager.createAppointmentByClient(appointmentData);
        res.status(201).json(createdAppointment);
    } catch (error) {
        next(error);
    }
};

export const createAppointmentByHairdresser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const manager = new AppointmentManager();
        
        if (!req.body) {
            throw new Error('Request body is empty');
        }

        const appointmentData: CreateAppointmentDto = req.body;
        const appointmentCreated = await manager.createAppointmentByHairdresser(appointmentData);

        res.status(201).json(appointmentCreated);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
            const manager = new AppointmentManager()
            const { limit, page, ...filters }: Criteria = req.query;
            const data = await manager.getAll({ limit, page, ...filters });
            res.send({ status: 'success', appointments: data.docs, ...data, docs: undefined })
        }
        catch(error)
        {
        next(error)
        }
}
        
export const getAppointmentById =  async (req: CustomRequest, res: Response, next: NextFunction)=>
{
        try
        {
        const manager = new AppointmentManager()
        let id : string = req.params.id
        res.status(200).json(await manager.getAppointmentById(id))
        }
        catch(error)
        {
        next(error)
        }
}

export const updateAppointment = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
        const manager = new AppointmentManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        let obj : Appointment = req.body as unknown as Appointment
        res.status(201).json(await manager.updateAppointment(obj, id))
        }
        catch(error)
        {
           next(error)
        }
}
        
export const deleteAppointment = async (req: CustomRequest, res: Response, next: NextFunction)=>
{
        try
        {
        const manager = new AppointmentManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        let appointmentToDelete = await manager.deleteAppointment(id)
        res.status(201).json(appointmentToDelete);
        }
        catch(error)
        {
           next(error)
        }
}