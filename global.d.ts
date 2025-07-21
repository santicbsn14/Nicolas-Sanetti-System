import { Request } from 'express';
import mongoose, { PaginateModel } from 'mongoose';
declare global {
  export interface CustomRequest<T = any> extends Request {
    body: T;
  }
}
declare module 'mongoose' {
  interface PaginateModel<T> extends mongoose.Model<T> {
    paginate: (query?: any, options?: any) => Promise<any>;
  }
}