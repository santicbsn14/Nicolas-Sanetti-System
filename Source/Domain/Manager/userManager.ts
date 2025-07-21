import { IUser} from "../../Data/Models/userSchema";
import { Criteria, IdMongo, Paginated } from "../../Utils/Types/typesMongoose";
import emailValidation from "../Validations/emailValidation";
import idValidation from "../Validations/idValidation";
import createUserValidation from "../Validations/CreatesValidation/createUserValidation";
import updateUserValidation from "../Validations/UserValidations/updateUserValidation";
import { createHash, validPassword } from "../../Utils/hashService";
import admin from "firebase-admin";
import pkg from 'firebase-admin'
import container from "../../container";
class UserManager {
    private userRepository

    constructor(){
        this.userRepository = container.resolve('UserRepository');
    }
    async getAll(criteria: Criteria){
       return await this.userRepository.getAll(criteria)
    }
    async getUserById(id: IdMongo){
        await idValidation.parseAsync(id)
        return await this.userRepository.getUserById(id)
    }
    async getUserByEmail(email: string){
        await emailValidation.parseAsync({email})
        return await this.userRepository.getUserByEmail(email)
    }
    async createUser(body:IUser){
        let {password, ...bodyUserDto} = body
        const { auth } = pkg;
        const hashedPassword = await createHash(password)
        let userResponse = await auth().createUser({
            email: body.email,
            password: hashedPassword,
            emailVerified: false,
            disabled: false
        });

        let userWithPassword = {...bodyUserDto,
            password:hashedPassword,
            fuid: userResponse.uid
        }
        
        if (userResponse){
            let user: IUser = await this.userRepository.createUser(userWithPassword);
            return user
        }
        return 'No se ha podido crear el usuario con exito'
    }
    async updateUser(body:IUser, id:IdMongo){
        await updateUserValidation.parseAsync({id, ...body})
        let user: IUser = await this.userRepository.getUserById(id)
        

        // const isHashedPassword = await validPassword(body.password.trim(), user.password)
        let {password, ...cleanPassword} = body
        
        // if (!isHashedPassword)
        //     {
        //         throw new Error('Updated failed, invalid password.');
        //     }

        return await this.userRepository.updateUser(id, cleanPassword)
    }
    async deleteUser(id: IdMongo){
        await idValidation.parseAsync(id)
        
        let userToDelete: IUser = await this.userRepository.getUserById(id)
       
        await admin.auth().deleteUser(userToDelete.fuid); 
        return await this.userRepository.deleteUser(id);
    }
}
export default UserManager