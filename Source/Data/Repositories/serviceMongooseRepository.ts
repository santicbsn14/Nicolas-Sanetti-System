import mongoose, { PaginateResult } from 'mongoose';
import Servicechema, { Service } from '../Models/serviceSchema';
import { Paginated, Criteria, IdMongo } from '../../Utils/Types/typesMongoose';
import { Role } from '../Models/roleSchema';
import serviceSchema from '../Models/serviceSchema';


interface ServiceRepository{
    getAll: (criteria :Criteria)=> Promise<Paginated<Service>| null>,
    createService: (Service: Service)=> Promise<Partial<Service> | null>,
    getServiceById: (serviceId: IdMongo) => Promise<Partial<Service>| null>,
    updateService: (serviceId:IdMongo, body: Partial<Service>) => Promise<Partial<Service> | null>,
    deleteService: (hairdresserId: IdMongo) => Promise<string>,
}



class ServiceMongooseRepository implements ServiceRepository {
  

  async getAll(criteria: Criteria): Promise<Paginated<Service>> {
    try {
      let { limit = 30, page = 1, ...filters } = criteria;
      //@ts-ignore
      const serviceDocuments: PaginateResult<Service> = await serviceSchema.paginate(filters, { limit, page});
      if(!serviceDocuments.page) serviceDocuments.page = 1
      const mappedDocs = serviceDocuments.docs.map(service => ({
        _id: service._id,
        name:  service.name,
        price: service.price,
        enabled:service.enabled,
        duration: service.duration,
        description:service.description,
        images_galery: service.images_galery,
        discount: service.discount,
        limit: service.limit,
        deadline_time:service.deadline_time
      }));
    
      return {
        //@ts-ignore
        docs: mappedDocs as Iservice[],
        totalDocs: serviceDocuments.totalDocs,
        limit: serviceDocuments.limit,
        totalPages: serviceDocuments.totalPages,
        pagingCounter: serviceDocuments.pagingCounter,
        hasPrevPage: serviceDocuments.hasPrevPage,
        hasNextPage: serviceDocuments.hasNextPage,
        page: serviceDocuments.page,
        prevPage: serviceDocuments.prevPage,
        nextPage: serviceDocuments.nextPage,
      };
    }
    catch (error) {
      throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
  async getServiceById(id: IdMongo): Promise<Partial<Service> | null>{
      const service = await serviceSchema.findById(id)
      if(service !== null){
      return {
        _id: service._id,
        name:  service.name,
        price: service.price,
        enabled:service.enabled,
        duration: service.duration,
        description:service.description,
        images_galery: service.images_galery,
        discount: service.discount,
        limit: service.limit,
        deadline_time:service.deadline_time
      }
    }
    throw new Error('Service not found');

  }
  async createService(body: Service): Promise<Partial<Service>|null>{
    const service = await serviceSchema.create(body)
    if(!service) throw new Error('A problem occurred when the user was created')
      return {
        _id: service._id,
        name:  service.name,
        price: service.price,
        enabled:service.enabled,
        duration: service.duration,
        description:service.description,
        images_galery: service.images_galery,
        discount: service.discount,
        limit: service.limit,
        deadline_time:service.deadline_time
      }
  }
  async updateService(serviceId: IdMongo, body: Partial<Service>):Promise<Partial<Service> | null>{
    const serviceUpdated = await serviceSchema.findByIdAndUpdate(serviceId, body, 
      { new: true, runValidators: true }
    )
    if(!serviceUpdated) throw new Error('A problem occurred when the service was updated')
    return {
        _id: serviceUpdated._id,
        name:  serviceUpdated.name,
        price: serviceUpdated.price,
        enabled:serviceUpdated.enabled,
        duration: serviceUpdated.duration,
        description:serviceUpdated.description,
        images_galery: serviceUpdated.images_galery,
        discount: serviceUpdated.discount,
        limit: serviceUpdated.limit,
        deadline_time:serviceUpdated.deadline_time
      }
  }
  async deleteService(serviceId:IdMongo):Promise<string>{
    const serviceDelete = await serviceSchema.findByIdAndDelete(serviceId)
    if(!serviceDelete) throw new Error('A problem occurred when the service was deleted')
    return `service with ID ${serviceId} has been successfully deleted.`;
  }
}
export default ServiceMongooseRepository