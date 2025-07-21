import { Hairdresser } from "../../Data/Models/hairdresserSchema";
import idValidation from "../Validations/idValidation";
import { Criteria, IdMongo } from "../../Utils/Types/typesMongoose";
import { CreateHairdresserDto } from "typesRequestDtos";
import container from "../../container";
import { IUser } from "Source/Data/Models/userSchema";
import createHairdresserValidation from "../Validations/CreatesValidation/createHairdresserValidation";


class HairdresserManager {
    private hairdresserRepository
    private userRepository
    constructor(){
        this.hairdresserRepository = container.resolve('HairdresserRepository');
        this.userRepository = container.resolve('UserRepository')
    }
    async getAll(criteria: Criteria){
       return await this.hairdresserRepository.getAll(criteria)
    }
    async getHairdresserById(id: IdMongo){
        await idValidation.parseAsync(id)
        return await this.hairdresserRepository.getHairdresserById(id)
    }
    async createHairdresser(bodyDto: CreateHairdresserDto){
        await createHairdresserValidation.parseAsync(bodyDto)
        let verifyHairdresserExist = await this.hairdresserRepository.getAll({user_id: bodyDto.user_id})

        if (verifyHairdresserExist.docs.length > 0) throw new Error('The user already has a hairdresser profile created');
        return await this.hairdresserRepository.createHairdresser(bodyDto)
    }
    async updateHairdresser(body:Hairdresser, id:IdMongo){
        await idValidation.parseAsync(id)
        return await this.hairdresserRepository.updateHairdresser(id, body)
    }
    async deleteHairdresser(id: IdMongo | string){
        await idValidation.parseAsync(id)
        return await this.hairdresserRepository.deleteHairdresser(id)
    }
}
export default HairdresserManager