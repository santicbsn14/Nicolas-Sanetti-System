import container from "../../container";
import { IUser } from "../../Data/Models/userSchema";
import { Criteria, IdMongo, Paginated } from "../../Utils/Types/typesMongoose";
import pkg from "firebase-admin";
import emailValidation from "../Validations/emailValidation";
import idValidation from "../Validations/idValidation";
import createUserValidation from "../Validations/CreatesValidation/createUserValidation";
import updateUserValidation from "../Validations/UserValidations/updateUserValidation";
import { CreateUserDto, userLogin } from "typesRequestDtos";
import { createHash } from "../../Utils/hashService";


class SessionManager {
    private userRepository

    constructor(){
        this.userRepository = container.resolve('UserRepository');
    }
    async getUserByEmail(email: string){
        await emailValidation.parseAsync({email})
        return await this.userRepository.getUserByEmail(email)
    }
    async signup(body: CreateUserDto){
        let {password, ...bodyUserDto} = body
        const { auth } = pkg;
        let userResponse = await auth().createUser({
            email: body.email,
            password: password,
            emailVerified: false,
            disabled: false
        });

        const hashedPassword = await createHash(password)
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
        await updateUserValidation.parseAsync({...body, id})
        if(body.password){
            const hashedPassword = await createHash(body.password)
            let userWithPassword = {...body,
                password:hashedPassword
            }
            let updatedUser = await this.userRepository.updateUser(id, userWithPassword)
            return updatedUser
        }
        return await this.userRepository.updateUser(body, id)
    }
}
export default SessionManager