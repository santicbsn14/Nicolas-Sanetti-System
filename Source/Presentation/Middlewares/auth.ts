import { NextFunction, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { IUser } from '../../Data/Models/userSchema';
import UserManager from '../../Domain/Manager/userManager';
import { userAuth } from 'typesRequestDtos';


const authMiddleware = async (req: CustomRequest<userAuth>, res: Response, next: NextFunction) => {
    try {
        let token = req.cookies.authToken;
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        const auth = getAuth();
        
        const decodedToken = await auth.verifyIdToken(token);
        if(decodedToken.email){
            let manager = new UserManager()
            let roleUser: IUser = await manager.getUserByEmail(decodedToken.email)
            //@ts-ignore 
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                role: roleUser.role
            };
        }

        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

export default authMiddleware;