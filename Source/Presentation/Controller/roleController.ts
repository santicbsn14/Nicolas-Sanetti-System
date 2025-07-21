import { NextFunction, Response } from 'express';
import RoleManager from '../../Domain/Manager/roleManager'
import { CreateRoleDto } from 'typesRequestDtos';
import { Criteria } from 'typesMongoose';

export const getAll = async  (req:CustomRequest<CreateRoleDto>, res: Response, next:NextFunction) =>
{
    const { limit, page }: Criteria = req.query;
    try 
    {
      const manager = new RoleManager();

      const roles = await manager.getAll({ limit, page });
  
      res.send({ status: 'success', roles: roles.docs, ...roles, docs: undefined });
    }
     catch (error) 
    {
     next(error) 
    }

};

export const getById = async (req:CustomRequest<CreateRoleDto>, res: Response, next:NextFunction) =>
{
  try 
  {
    const { id } = req.params;

    const manager = new RoleManager();
    const role = await manager.getOne(id);

    res.send({ status: 'success', role });
  } 
  catch (error) 
  {
    next(error)
  }

};

export const create = async (req:CustomRequest<CreateRoleDto>, res: Response, next:NextFunction) =>
{
  try 
  {
    const manager = new RoleManager();
    const role = await manager.create(req.body);
  
    res.send({ status: 'success', role, message: 'Role created.' })
  } 
  catch (error) 
  {
    next(error)
  }

};

export const update = async (req:CustomRequest<CreateRoleDto>, res: Response, next:NextFunction) =>
{
  try 
  {
    const { id } = req.params;

    const manager = new RoleManager();
    const result = await manager.updateOne(id, req.body);
  
    res.send({ status: 'success', result, message: 'Role updated.' })
  } 
  catch (error) 
  {
    next(error)
  }

};

export const deleteOne = async (req:CustomRequest<CreateRoleDto>, res: Response, next:NextFunction) =>
{
  try 
  {
    const { id } = req.params;

    const manager = new RoleManager();
    await manager.deleteOne(id);
  
    res.send({ status: 'success', message: 'Role deleted.' })
  } 
  catch (error) 
  {
    next(error)
  }

};