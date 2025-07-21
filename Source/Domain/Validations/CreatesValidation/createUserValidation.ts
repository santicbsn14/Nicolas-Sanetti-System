import z from 'zod'

const createUserValidation= z.object(
    {
        firstname: z.string().min(4).max(20),
        lastname: z.string().min(4).max(20),
        email: z.string().email(),
        age: z.number(),
        dni:z.number(),
        fuid:z.string(),
        phone: z.number(),
        password: z.string()
    }
)
export default createUserValidation 