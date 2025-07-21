import { NextFunction, Response } from "express";
import { IUser } from "../../Data/Models/userSchema";
import UserManager from "../../Domain/Manager/userManager";
import { IdMongo, Criteria } from "typesMongoose";
import { createHash } from "../../Utils/hashService";


export const createUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const manager = new UserManager();
        
        if (!req.body) {
            throw new Error('Request body is empty');
        }

        const { password, ...userData } = req.body;
        
        const hashedPassword = await createHash(password);
        
        const user = {
            ...userData,
            password: hashedPassword
        };

        const createdUser = await manager.createUser(user as IUser);
        
        res.status(201).json(createdUser);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
        try
        {
            const manager = new UserManager()
            const { limit, page }: Criteria = req.query;
            const data = await manager.getAll({ limit, page });
            res.send({ status: 'success', users: data.docs, ...data, docs: undefined })
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
        const manager = new UserManager()
        let uid : IdMongo = req.params.id as unknown as IdMongo
        res.status(200).json(await manager.getUserById(uid))
        }
        catch(error)
        {
        next(error)
        }
}

export const getByEmail =  async (req: CustomRequest, res: Response, next: NextFunction)=>
    {
            try
            {
            const manager = new UserManager()
            if(!req.query){
                throw new Error('No se obtuvo el email')
            }
            let {email} = req.query
 
            res.status(200).json(await manager.getUserByEmail(email as string))
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
        const manager = new UserManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        let obj : IUser = req.body as unknown as IUser
        res.status(201).json(await manager.updateUser(obj, id))
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
        const manager = new UserManager()
        let id : IdMongo = req.params.id as unknown as IdMongo;
        res.status(201).json(await manager.deleteUser(id))
        }
        catch(error)
        {
           next(error)
        }
}