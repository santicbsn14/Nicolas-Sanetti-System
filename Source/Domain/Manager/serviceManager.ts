import {type Service } from "../../Data/Models/serviceSchema"
import idValidation from "../Validations/idValidation";
import { Criteria, IdMongo } from "../../Utils/Types/typesMongoose";
 import createServiceValidation from "../Validations/CreatesValidation/createServiceValidation";
import { CreateServiceDto } from "typesRequestDtos";
import mongoose from "mongoose";
import dayjs from "dayjs";
import container from "../../container";


class ServiceManager {
    private serviceRepository
    private hairdresserRepository
    constructor(){
        this.serviceRepository = container.resolve('ServiceRepository');
        this.hairdresserRepository= container.resolve('HairdresserRepository')
    }
    async getAll(criteria: Criteria){
       return await this.serviceRepository.getAll(criteria)
    }
    async getServiceById(id: string | IdMongo){
        await idValidation.parseAsync(id)
        return await this.serviceRepository.getServiceById(id)
    }
    async createService(bodyDto:CreateServiceDto){
        const body: Service = {
            name: bodyDto.name,
            price: bodyDto.price,
            enabled: bodyDto.enabled,
            duration: bodyDto.duration,
            description: bodyDto.description,
            images_galery: bodyDto.images_galery,
        };
    
        if (bodyDto.discount !== undefined) body.discount = bodyDto.discount;
        if (bodyDto.limit !== undefined) body.limit = bodyDto.limit;
        if (bodyDto.deadline_time !== undefined) body.deadline_time = dayjs(bodyDto.deadline_time);
        await createServiceValidation.parseAsync(body)

        return await this.serviceRepository.createService(body)
    }
    async updateService(body:Service, id:IdMongo){
        await idValidation.parseAsync(id)
        return await this.serviceRepository.updateService(id, body)
    }
    async deleteService(id: IdMongo){
        await idValidation.parseAsync(id)
        return await this.serviceRepository.deleteService(id)
    }
}
export default ServiceManager