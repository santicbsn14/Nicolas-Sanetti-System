import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const createHash = async (password: string)=>
{
       return await bcrypt.hash(password, 10)
}
export const validPassword = async (password: string, userpasswordhash:string)=>
{
       return await bcrypt.compare(password, userpasswordhash)
}