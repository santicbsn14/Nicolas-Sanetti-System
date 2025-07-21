import mongoose, { PaginateResult } from 'mongoose';
import clientSchema, { IClient } from '../Models/clientSchema';
import { Paginated, Criteria, IdMongo } from '../../Utils/Types/typesMongoose';
import { Role } from '../Models/roleSchema';


interface clientRepository{
    getAll: (criteria :Criteria)=> Promise<Paginated<IClient>| null>,
    createClient: (client: IClient)=> Promise<Partial<IClient> | null>,
    getClientByEmail: (client: IClient['email'])=> Promise<Partial<IClient> | null>,
    getClientById: (clientId: IdMongo) => Promise<Partial<IClient>| null>,
    updateClient: (clientId:IdMongo, body: Partial<IClient>) => Promise<Partial<IClient> | null>,
    deleteClient: (clientId: IdMongo) => Promise<string>,
}



class ClientMongooseRepository implements clientRepository {
  

  async getAll(criteria: Criteria): Promise<Paginated<IClient>> {
    try {
      let { limit = 30, page = 1, ...filters } = criteria;
      
      const clientDocuments: PaginateResult<IClient> = await clientSchema.paginate(filters, { limit, page });
      if(!clientDocuments.page) clientDocuments.page = 1
      const mappedDocs = clientDocuments.docs.map(client => ({
        firstname:client.firstname ,
        lastname: client.lastname ,
        email:client.email,
        age: client.age,
        dni: client.dni ,
        phone: client.phone ,
        next_appointment: client.next_appointment,
        appointment_history: client.appointments_history,
        _id: client._id 
      }));
    
      return {
        //@ts-ignore
        docs: mappedDocs as IClient[],
        totalDocs: clientDocuments.totalDocs,
        limit: clientDocuments.limit,
        totalPages: clientDocuments.totalPages,
        pagingCounter: clientDocuments.pagingCounter,
        hasPrevPage: clientDocuments.hasPrevPage,
        hasNextPage: clientDocuments.hasNextPage,
        page: clientDocuments.page,
        prevPage: clientDocuments.prevPage,
        nextPage: clientDocuments.nextPage,
      };
    }
    catch (error) {
      throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
  async getClientById(id: IdMongo): Promise<Partial<IClient> | null>{
      const client = await clientSchema.findById(id)
      if(client !== null){
      return {
        firstname:client.firstname ,
        lastname: client.lastname ,
        email:client.email,
        age: client.age,
        dni: client.dni ,
        phone: client.phone ,
        next_appointment: client.next_appointment,
        appointments_history: client.appointments_history,
        _id: client._id 
      }
    }
    return null

  }
  async getClientByEmail(clientEmail: IClient['email']): Promise<Partial<IClient>| null>{
    const client = await clientSchema.findOne({email: clientEmail})
    if(!client) throw new Error('Client not Found');
    return{
        firstname:client.firstname ,
        lastname: client.lastname ,
        email:client.email,
        age: client.age,
        dni: client.dni ,
        phone: client.phone ,
        next_appointment: client.next_appointment,
        appointments_history: client.appointments_history,
        _id: client._id 
    }
  }
  async createClient(body: IClient): Promise<Partial<IClient>|null>{
    const newClient = await clientSchema.create(body)

    if(!newClient) throw new Error('A problem occurred when the client was created')
    return {
        firstname:newClient.firstname ,
        lastname: newClient.lastname ,
        email:newClient.email,
        age: newClient.age,
        dni: newClient.dni ,
        phone: newClient.phone ,
        next_appointment: newClient.next_appointment,
        appointments_history: newClient.appointments_history,
        _id: newClient._id 
    }
  }
  async updateClient(clientId: IdMongo, body: Partial<IClient>):Promise<Partial<IClient> | null>{
    const clientUpdated = await clientSchema.findByIdAndUpdate(clientId, body, 
      { new: true, runValidators: true }
    )
    if(!clientUpdated) throw new Error('A problem occurred when the client was updated')
    return {
        firstname:clientUpdated.firstname ,
        lastname: clientUpdated.lastname ,
        email:clientUpdated.email,
        age: clientUpdated.age,
        dni: clientUpdated.dni ,
        phone: clientUpdated.phone ,
        next_appointment: clientUpdated.next_appointment,
        appointments_history: clientUpdated.appointments_history,
        _id: clientUpdated._id 
      }
  }
  async deleteClient(clientId:IdMongo):Promise<string>{
    const clientDelete = await clientSchema.findByIdAndDelete(clientId)
    if(!clientDelete) throw new Error('A problem occurred when the client was deleted')
    return `Client with ID ${clientId} has been successfully deleted.`;
  }
  async findClientByUniqueFields(fields: { email: string; dni: number; phone: number }): Promise<IClient | null> {
      return await clientSchema.findOne({
          $or: [
              { email: fields.email },
              { dni: fields.dni },
              { phone: fields.phone }
          ]
      });
  }
}
export default ClientMongooseRepository