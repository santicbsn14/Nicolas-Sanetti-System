import z from 'zod'
const emailValidation = z.object(
    {
        email: z.string().email()
    }
)
export default emailValidation