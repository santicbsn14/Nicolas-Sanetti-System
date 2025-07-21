import mongoose, { PaginateResult } from 'mongoose';
import userSchema, { IUser } from '../Models/userSchema';
import { Paginated, Criteria, IdMongo } from '../../Utils/Types/typesMongoose';
import { Role } from '../Models/roleSchema';


interface userRepository{
    getAll: (criteria :Criteria)=> Promise<Paginated<IUser>| null>,
    createUser: (user: IUser)=> Promise<Partial<IUser> | null>,
    getUserByEmail: (user: IUser['email'])=> Promise<Partial<IUser> | null>,
    getUserById: (userId: IdMongo) => Promise<Partial<IUser>| null>,
    updateUser: (userId:IdMongo, body: Partial<IUser>) => Promise<Partial<IUser> | null>,
    deleteUser: (userId: IdMongo) => Promise<string>,
}



class UserMongooseRepository implements userRepository {
  

  async getAll(criteria: Criteria): Promise<Paginated<IUser>> {
    try {
      let { limit = 30, page = 1, ...filters } = criteria;
      
      const userDocuments: PaginateResult<IUser> = await userSchema.paginate(filters, { limit, page,
        populate:'role' });
      if(!userDocuments.page) userDocuments.page = 1
      const mappedDocs = userDocuments.docs.map(user => ({
        firstname:user.firstname ,
        lastname: user.lastname ,
        email:user.email,
        age: user.age,
        dni: user.dni ,
        phone: user.phone ,
        role: user.role ,
        id: user._id,
        fuid:user.fuid
      }));
    
      return {
        //@ts-ignore
        docs: mappedDocs as IUser[],
        totalDocs: userDocuments.totalDocs,
        limit: userDocuments.limit,
        totalPages: userDocuments.totalPages,
        pagingCounter: userDocuments.pagingCounter,
        hasPrevPage: userDocuments.hasPrevPage,
        hasNextPage: userDocuments.hasNextPage,
        page: userDocuments.page,
        prevPage: userDocuments.prevPage,
        nextPage: userDocuments.nextPage,
      };
    }
    catch (error) {
      throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
  async getUserById(id: IdMongo): Promise<Partial<IUser> | null>{

      const user = await userSchema.findById(id).populate('role')

      if(user !== null){
      return {
        firstname:user.firstname ,
        lastname: user.lastname ,
        email:user.email,
        age: user.age,
        dni: user.dni ,
        phone: user.phone,
        password:user.password,
        role: user.role as unknown as Role,
        _id: user._id  ,
        fuid: user.fuid
      }
    }
    throw new Error('User not Found');

  }
  async getUserByEmail(userEmail: IUser['email']): Promise<Partial<IUser>| null>{
    const user = await userSchema.findOne({email: userEmail}).populate('role')
    if(!user) throw new Error('User not Found');
    return{
      firstname:user.firstname ,
      lastname: user.lastname ,
      email:user.email,
      age: user.age,
      dni: user.dni ,
      phone: user.phone ,
      role: user.role as unknown as Role,
      password: user.password,
      _id: user._id,
      fuid:user.fuid  
    }
  }
  async createUser(body: IUser): Promise<Partial<IUser>|null>{
    const user = await userSchema.create(body)
    if(!user) throw new Error('A problem occurred when the user was created')
    return {
      firstname:user.firstname ,
      lastname: user.lastname ,
      email:user.email,
      age: user.age,
      dni: user.dni ,
      phone: user.phone ,
      role: user.role as unknown as Role,
      _id: user._id,
      fuid: user.fuid
    }
  }
  async updateUser(userId: IdMongo, body: Partial<IUser>):Promise<Partial<IUser> | null>{
    const userUpdated = await userSchema.findByIdAndUpdate(userId, body, 
      { new: true, runValidators: true }
    )
    if(!userUpdated) throw new Error('A problem occurred when the user was updated')
    return {
        firstname:userUpdated.firstname ,
        lastname: userUpdated.lastname ,
        email:userUpdated.email,
        age: userUpdated.age,
        dni: userUpdated.dni ,
        phone: userUpdated.phone ,
        role: userUpdated.role as unknown as Role,
        _id: userUpdated._id,
        fuid: userUpdated.fuid
      }
  }
  async deleteUser(userId:IdMongo):Promise<string>{
    const userDelete = await userSchema.findByIdAndDelete(userId)
    if(!userDelete) throw new Error('A problem occurred when the user was deleted')
    return `User with ID ${userId} has been successfully deleted.`;
  }
}
export default UserMongooseRepository