import { Criteria, IdMongo } from "typesMongoose";
import { Role } from "Source/Data/Models/roleSchema.js";
import container from "../../container";
class RoleManager
{
    private roleRepository
  constructor()
  {
     this.roleRepository = container.resolve('RoleRepository')
  }

  async getAll(criteria: Criteria)
  {
    return this.roleRepository.getAll(criteria);
  }

  async getOne(id:string)
  {
    return this.roleRepository.getRoleById(id);
  }

  async create(data: Role)
  {
    return await this.roleRepository.createRole(data);
  }

  async updateOne(id: string, data: Role)
  {
    return this.roleRepository.updateRole(id, data);
  }

  async deleteOne(id: string)
  {
    return this.roleRepository.deleteRole(id);
  }
}

export default RoleManager;