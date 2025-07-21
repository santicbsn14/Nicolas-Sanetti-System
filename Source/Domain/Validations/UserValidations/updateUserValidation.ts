import z from "zod";

const idValidation = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Input not instance of ObjectId"),
});

const updateUserValidation = idValidation.extend({
  firstname: z.string().min(4).max(20).optional(),
  lastname: z.string().min(4).max(20).optional(),
  email: z.string().email().optional(),
  age: z.number().optional(),
  dni: z.number().optional(),
  fuid: z.string().optional(),
  phone: z.number().optional(),
  password: z.string().optional(),
});

export default updateUserValidation;