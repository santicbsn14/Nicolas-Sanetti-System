import mongoose, { PaginateResult } from 'mongoose';
import professionalTimeSlotsSchema, {ProfessionalTimeSlots} from '../Models/professionalTimeSlotsSchema';
import { Paginated, Criteria, IdMongo } from '../../Utils/Types/typesMongoose';

interface IProfessionalTimeSlotsRepository{
    getAll: (criteria :Criteria)=> Promise<Paginated<ProfessionalTimeSlots>| null>,
    createProfessionalTimeSlots: (professionalTimeSlots: ProfessionalTimeSlots)=> Promise<ProfessionalTimeSlots | null>,
    getProfessionalTimeSlotsById: (professionalTimeSlotsId: IdMongo) => Promise<ProfessionalTimeSlots | null>,
    getProfessionalTimeSlotsByPro: (hairdresser_id: IdMongo) =>Promise<ProfessionalTimeSlots | null>,
    updateProfessionalTimeSlots: (professionalTimeSlotsId:IdMongo, body: Partial<ProfessionalTimeSlots>) => Promise<ProfessionalTimeSlots | null>,
    deleteProfessionalTimeSlots: (professionalTimeSlotsId: IdMongo) => Promise<string>
}

class ProfessionalTimeSlotsRepository implements IProfessionalTimeSlotsRepository{
    async getAll(criteria: Criteria):Promise<Paginated<ProfessionalTimeSlots>| null> {
      let { limit = 30, page = 1, ...filters  } = criteria;
      //@ts-ignore se vera luego...
      const professionalTimeSlotssDocuments:PaginateResult<ProfessionalTimeSlots> = await professionalTimeSlotsSchema.paginate(filters, { limit, page });
  
      if(!professionalTimeSlotssDocuments) throw new Error('ProfessionalTimeSlotss could not be accessed')
      if(!professionalTimeSlotssDocuments.page) professionalTimeSlotssDocuments.page = 1
  
      const mappedProfessionalTimeSlots = professionalTimeSlotssDocuments.docs.map((professionalTimeSlots) => {
        return {
            _id: professionalTimeSlots._id,
            hairdresser_id: professionalTimeSlots.hairdresser_id,
            schedule:professionalTimeSlots.schedule,
        }
      })
      return {
        docs: mappedProfessionalTimeSlots ,
        totalDocs: professionalTimeSlotssDocuments.totalDocs,
        limit: professionalTimeSlotssDocuments.limit,
        totalPages:professionalTimeSlotssDocuments.totalPages,
        pagingCounter: professionalTimeSlotssDocuments.pagingCounter,
        hasPrevPage: professionalTimeSlotssDocuments.hasPrevPage,
        hasNextPage: professionalTimeSlotssDocuments.hasNextPage,
        page: professionalTimeSlotssDocuments.page,
        prevPage: professionalTimeSlotssDocuments.prevPage,
        nextPage: professionalTimeSlotssDocuments.nextPage,
      };
    }
    async createProfessionalTimeSlots(body: ProfessionalTimeSlots):Promise<ProfessionalTimeSlots | null>{
      const newProfessionalTimeSlots :ProfessionalTimeSlots = await professionalTimeSlotsSchema.create(body)
      if(!newProfessionalTimeSlots) throw new Error('A problem occurred when the ProfessionalTimeSlots was created')
        return {
            _id: newProfessionalTimeSlots._id,
            hairdresser_id: newProfessionalTimeSlots.hairdresser_id,
            schedule: newProfessionalTimeSlots.schedule,
        }
    }
    async getProfessionalTimeSlotsById(id: IdMongo):Promise<ProfessionalTimeSlots|null>{
  
      const ProfessionalTimeSlots = await professionalTimeSlotsSchema.findById(id)
      if(!ProfessionalTimeSlots) throw new Error('ProfessionalTimeSlots could not found')
        return {
            _id: ProfessionalTimeSlots._id,
            hairdresser_id: ProfessionalTimeSlots.hairdresser_id,
            schedule: ProfessionalTimeSlots.schedule,
        }
    }
    async getProfessionalTimeSlotsByPro(hairdresser_id: IdMongo):Promise<ProfessionalTimeSlots| null>{
      const ProfessionalTimeSlots  = await professionalTimeSlotsSchema.findOne({hairdresser_id: hairdresser_id})
      if(!ProfessionalTimeSlots) return null
      return {
        _id: ProfessionalTimeSlots._id,
        hairdresser_id: ProfessionalTimeSlots.hairdresser_id,
        schedule: ProfessionalTimeSlots.schedule,
    }
    }
    async updateProfessionalTimeSlots(id: IdMongo, body :Partial<ProfessionalTimeSlots>):Promise<ProfessionalTimeSlots|null>{
      const updatedProfessionalTimeSlots = await professionalTimeSlotsSchema.findByIdAndUpdate(
        id, 
        { $set: body }, // Usar $set para actualizar los campos especificados
        { new: true, runValidators: true } // Opciones de retorno y validación
    );
      if(!updatedProfessionalTimeSlots) throw new Error('A problem occurred when the ProfessionalTimeSlots was updated')
      
        return {
            _id: updatedProfessionalTimeSlots._id,
            hairdresser_id: updatedProfessionalTimeSlots.hairdresser_id,
            schedule: updatedProfessionalTimeSlots.schedule,
        }
    }
    async deleteProfessionalTimeSlots(id:IdMongo):Promise<string>{
      const ProfessionalTimeSlotsDeleted = await professionalTimeSlotsSchema.findByIdAndDelete(id)
      if(!ProfessionalTimeSlotsDeleted) throw new Error('A problem occurred when the ProfessionalTimeSlots was deleted')
        return `ProfessionalTimeSlots with ID ${id} has been successfully deleted.`;
    }
  }
  export default ProfessionalTimeSlotsRepository