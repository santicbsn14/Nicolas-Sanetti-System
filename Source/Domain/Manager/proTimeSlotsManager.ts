import container from "../../container";
import { type ProfessionalTimeSlots } from "../../Data/Models/professionalTimeSlotsSchema"
import idValidation from "../Validations/idValidation";
import { Criteria, IdMongo } from "../../Utils/Types/typesMongoose";
import createProfessionalTimeSlotsValidation from "../Validations/CreatesValidation/createProfessionalTimesSlots";
import { CreateProfessionalTimeSlotsDto } from "typesRequestDtos";




class ProfessionalTimeSlotsManager {
    private professionalTimeSlotsRepository
    private hairdresserRepository
    constructor(){
        this.professionalTimeSlotsRepository = container.resolve('ProfessionalTimeSlotsRepository');
        this.hairdresserRepository= container.resolve('HairdresserRepository')
    }
    async getAll(criteria: Criteria){
       return await this.professionalTimeSlotsRepository.getAll(criteria)
    }
    async getProfessionalTimeSlotsById(id: IdMongo){
        await idValidation.parseAsync(id)
        return await this.professionalTimeSlotsRepository.getProfessionalTimeSlotsById(id)
    }
    async getProfessionalTimeSlotsByPro(id: IdMongo){
        await idValidation.parseAsync(id)
        let proTimeSlots = await this.professionalTimeSlotsRepository.getProfessionalTimeSlotsByPro(id)
        if(!proTimeSlots) throw new Error('No se han configurado los horarios de este profesional')
        return proTimeSlots
    }
    async createProfessionalTimeSlots(bodyDto:CreateProfessionalTimeSlotsDto){
        let body   = {...bodyDto, hairdresser_id: bodyDto.hairdresser_id}
    
        await createProfessionalTimeSlotsValidation.parseAsync(body)

        let verifyProfessional = await this.hairdresserRepository.getHairdresserById(bodyDto.hairdresser_id)
        if(!verifyProfessional) throw new Error('Hairdresser not found')

        let verifyProTimeSlot = await this.professionalTimeSlotsRepository.getProfessionalTimeSlotsByPro(bodyDto.hairdresser_id)
        if(verifyProTimeSlot) throw new Error('El peluquero ya tiene un horario creado')
        return await this.professionalTimeSlotsRepository.createProfessionalTimeSlots(body)
    }
    async updateProfessionalTimeSlots( id:IdMongo, body:ProfessionalTimeSlots){
        await idValidation.parseAsync(id)
        return await this.professionalTimeSlotsRepository.updateProfessionalTimeSlots(id, body)
    }
    async deleteProfessionalTimeSlots(id: IdMongo){
        await idValidation.parseAsync(id)
        return await this.professionalTimeSlotsRepository.deleteProfessionalTimeSlots(id)
    }
}
export default ProfessionalTimeSlotsManager