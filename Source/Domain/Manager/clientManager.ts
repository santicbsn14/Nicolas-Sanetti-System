
import { IClient } from "../../Data/Models/clientSchema";
import idValidation from "../Validations/idValidation";
import { Criteria, IdMongo } from "../../Utils/Types/typesMongoose";
import { CreateClientDto } from "typesRequestDtos";

import { IUser } from "Source/Data/Models/userSchema";
import createClientValidation from "../Validations/CreatesValidation/createClientValidation";
import container from "../../container";


class ClientManager {
    private clientRepository
    private userRepository
    constructor(){
        this.clientRepository = container.resolve('ClientRepository');
        this.userRepository = container.resolve('UserRepository')
    }
    async getAll(criteria: Criteria){
       return await this.clientRepository.getAll(criteria)
    }
    async getClientById(id: IdMongo){
        await idValidation.parseAsync(id)
        return await this.clientRepository.getClientById(id)
    }
    async createClient(bodyDto: CreateClientDto){
        await createClientValidation.parseAsync(bodyDto)
        return await this.clientRepository.createClient(bodyDto)
    }
    async updateClient(body:IClient, id:IdMongo){
        await idValidation.parseAsync(id)
        return await this.clientRepository.updateClient(id, body)
    }
    async deleteClient(id: IdMongo | string){
        await idValidation.parseAsync(id)
        return await this.clientRepository.deleteClient(id)
    }
}
export default ClientManager