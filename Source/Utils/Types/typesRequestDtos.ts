
import { Dayjs } from "dayjs";
import mongoose, { ObjectId } from "mongoose";
import { Appointment, appointmentState } from "Source/Data/Models/appointmentSchema";
import { ClientModel } from "Source/Data/Models/clientSchema";
import { limitServices } from "Source/Data/Models/hairdresserSchema";
import { DaySchedule } from "Source/Data/Models/professionalTimeSlotsSchema";
import { Service } from "Source/Data/Models/serviceSchema";
export interface CreateAppointmentDto {
    client_id:  mongoose.Types.ObjectId |  ClientModel,
    hairdresser_id: mongoose.Types.ObjectId | string,
    date_time: Dayjs | Date,
    state: appointmentState,
    service_id: mongoose.Types.ObjectId | string,
    notes?: string[],
}      
export interface CreateClientDto {
    firstname: string;
    lastname: string;
    email: string;
    age: number;
    dni: number,
    phone: number,
    appointments_history?:Appointment[] | mongoose.Types.ObjectId[] | string[];
    next_appointment?: Appointment | mongoose.Types.ObjectId | string;
    _id?: mongoose.Types.ObjectId
}
export interface CreateServiceDto{
    name:  string,
    price: number,
    enabled:boolean,
    duration: number,
    description:string,
    images_galery: string[],
    discount?: string,
    limit?: boolean,
    deadline_time?:Dayjs | Date
}
export interface TimeSlot {
    start_time: string;
    end_time: number;
}

export interface DayScheduleDto {
    week_day: number; 
    time_slots: TimeSlot;
}
export interface CreateProfessionalTimeSlotsDto {
    hairdresser_id: mongoose.Types.ObjectId | string,
    schedule:DayScheduleDto[],
    state: string;
}
export interface CreateHairdresserDto {
    user_id: mongoose.Types.ObjectId | string,
    _id?: mongoose.Types.ObjectId,
    services: Service[] | mongoose.Types.ObjectId | string,
    state: 'Disponible' | 'No disponible' | 'Vacaciones' | 'Feriado' ;
    limit_services: limitServices[]
}
export interface CreateNotificationDto{
    appointment_id:  mongoose.Types.ObjectId | string,
    type: string,
    state: string,
    date_send: Date,
    note: string
}
export interface CreateDailyHourAvailabilityDto{
    hairdresser_id: mongoose.Types.ObjectId | string,
    date: Date;
    hourly_slots: {
        hour: number; // 0-23
        max_sessions: number;
        current_sessions: number;
    }[];
}
export interface CreateRoleDto{
    name: string,
    id?: string,
    permissions:string[]
}
export interface CreateUserDto{
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    age: number,
    dni: number,
    role: mongoose.Types.ObjectId | string,
    phone: number,
}
export interface userAuth {
    user: {
        email: string,
        password: string
    }
}



export interface AuthenticatedRequest<T = unknown> extends Omit<Request, 'body'> {
    user?: userAuth;
    body: T;
}

export type userLogin = {
    email:string,
    password: string
}
