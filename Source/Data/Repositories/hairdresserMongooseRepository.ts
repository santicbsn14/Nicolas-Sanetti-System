import { PaginateResult } from 'mongoose';
import { Paginated, Criteria, IdMongo } from '../../Utils/Types/typesMongoose';
import hairdresserSchema,{Hairdresser} from '../Models/hairdresserSchema';


interface HairdresserRepository{
    getAll: (criteria :Criteria)=> Promise<Paginated<Hairdresser>| null>,
    createHairdresser: (hairdresser: Hairdresser)=> Promise<Partial<Hairdresser> | null>,
    getHairdresserById: (hairdresserId: IdMongo) => Promise<Partial<Hairdresser>| null>,
    updateHairdresser: (hairdresserId:IdMongo, body: Partial<Hairdresser>) => Promise<Partial<Hairdresser> | null>,
    deleteHairdresser: (userId: IdMongo) => Promise<string>,
}



class HairdresserMongooseRepository implements HairdresserRepository {
  

  async getAll(criteria: Criteria): Promise<Paginated<Hairdresser>> {
    try {
      let { limit = 30, page = 1, ...filters } = criteria;
      //@ts-ignore
      const hairdresserDocuments: PaginateResult<Hairdresser> = await hairdresserSchema.paginate(filters, { limit, page,
        populate:'user_id' });
      if(!hairdresserDocuments.page) hairdresserDocuments.page = 1
      const mappedDocs = hairdresserDocuments.docs.map(hairdresser => ({
        user_id: hairdresser.user_id,
        _id: hairdresser._id,
        services: hairdresser.services,
        state: hairdresser.state,
        limit_services:hairdresser.limit_services

      }));
    
      return {
        //@ts-ignore
        docs: mappedDocs as Iservice[],
        totalDocs: hairdresserDocuments.totalDocs,
        limit: hairdresserDocuments.limit,
        totalPages: hairdresserDocuments.totalPages,
        pagingCounter: hairdresserDocuments.pagingCounter,
        hasPrevPage: hairdresserDocuments.hasPrevPage,
        hasNextPage: hairdresserDocuments.hasNextPage,
        page: hairdresserDocuments.page,
        prevPage: hairdresserDocuments.prevPage,
        nextPage: hairdresserDocuments.nextPage,
      };
    }
    catch (error) {
      throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
  async getHairdresserById(id: IdMongo): Promise<Partial<Hairdresser> | null>{
      const hairdresser = await hairdresserSchema.findById(id).populate(['user_id', 'services'])
      if(hairdresser !== null){
      return {
        user_id: hairdresser.user_id,
        _id: hairdresser._id,
        services: hairdresser.services,
        state: hairdresser.state,
        limit_services:hairdresser.limit_services
      }
    }
    throw new Error('Hairdresser could not found');

  }
  async createHairdresser(body: Hairdresser): Promise<Partial<Hairdresser>|null>{

    const newHairdresser = await hairdresserSchema.create(body)
    
    if(!newHairdresser) throw new Error('A problem occurred when the hairdresser was created')
      return {
        user_id: newHairdresser.user_id,
        _id: newHairdresser._id,
        services: newHairdresser.services,
        state: newHairdresser.state,
        limit_services:newHairdresser.limit_services
      }
  }
  async updateHairdresser(userId: IdMongo, body: Partial<Hairdresser>):Promise<Partial<Hairdresser> | null>{
    const hairdresserUpdated = await hairdresserSchema.findByIdAndUpdate(userId, body, 
      { new: true, runValidators: true }
    )
    if(!hairdresserUpdated) throw new Error('A problem occurred when the hairdresser was updated')
    return {
        user_id: hairdresserUpdated.user_id,
        _id: hairdresserUpdated._id,
        services: hairdresserUpdated.services,
        state: hairdresserUpdated.state,
        limit_services:hairdresserUpdated.limit_services
      }
  }
  async deleteHairdresser(hairdresserId:IdMongo):Promise<string>{
    const hairdresserDelete = await hairdresserSchema.findByIdAndDelete(hairdresserId)
    if(!hairdresserDelete) throw new Error('A problem occurred when the hairdresser was deleted')
    return `hairdresser with ID ${hairdresserId} has been successfully deleted.`;
  }
}
export default HairdresserMongooseRepository