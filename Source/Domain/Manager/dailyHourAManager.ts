import {type DailyHourAvailability } from "../../Data/Models/dailyHourASchema"
import idValidation from "../Validations/idValidation";
import { Criteria, IdMongo } from "../../Utils/Types/typesMongoose";
import createDailyHourAvailabilityValidation from "../Validations/CreatesValidation/createDHAValidation";
import { CreateDailyHourAvailabilityDto } from "typesRequestDtos";
import mongoose from "mongoose";
import dayjs from "dayjs";
import container from "../../container";




class DailyHourAvailabilityManager {
    private dailyHourAvailabilityRepository
    private hairdresserRepository
    constructor(){
        this.dailyHourAvailabilityRepository = container.resolve('DailyHourAvailabilityRepository');
        this.hairdresserRepository= container.resolve('HairdresserRepository')
    }
    async getAll(criteria: Criteria){
       return await this.dailyHourAvailabilityRepository.getAll(criteria)
    }
    async getDailyHourAvailabilityById(id: string){
        await idValidation.parseAsync(id)
        return await this.dailyHourAvailabilityRepository.getDailyHourAvailabilityById(id)
    }
    async createDailyHourAvailability(bodyDto:CreateDailyHourAvailabilityDto){
        const body: DailyHourAvailability = {
            hairdresser_id: bodyDto.hairdresser_id,
            date: dayjs(bodyDto.date).startOf('day'),
            hourly_slots: bodyDto.hourly_slots,
        };
        await createDailyHourAvailabilityValidation.parseAsync(body)
        
        let verifyHairdresser = await this.hairdresserRepository.getHairdresserById(bodyDto.hairdresser_id)

        if(!verifyHairdresser) throw new Error('Hairdresser not found')

        return await this.dailyHourAvailabilityRepository.createDailyHourAvailability(body)
    }
    async updateDailyHourAvailability(body:DailyHourAvailability, id:IdMongo){
        await idValidation.parseAsync(id)
        return await this.dailyHourAvailabilityRepository.updateDailyHourAvailability(id, body)
    }
    async deleteDailyHourAvailability(id: IdMongo){
        await idValidation.parseAsync(id)
        return await this.dailyHourAvailabilityRepository.deleteDailyHourAvailability(id)
    }
}
export default DailyHourAvailabilityManager