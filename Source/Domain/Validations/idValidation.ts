import mongoose from 'mongoose'
import z from 'zod'

const idValidation = z.union([
    z.string().length(24),
    z.instanceof(mongoose.Types.ObjectId)
  ]);
export default idValidation