import { NextFunction, Response } from "express";

const authorization = (permission: string) =>
{
    return async(req:CustomRequest, res: Response, next: NextFunction) =>
    {
        //@ts-ignore

        const user = req.user;
        if (user.role?.name === 'Admin') {
            return next();
        }
        if (!user.role?.permissions?.includes(permission))
        {
            return res.status(401).send({ message: 'Not authorization!' });
        }
        next();
    }
}

export default authorization;