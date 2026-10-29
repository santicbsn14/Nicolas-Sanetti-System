import dotenv from 'dotenv'
dotenv.config()
import { createContainer, asClass, Lifetime } from 'awilix'
import UserRepository from './Data/Repositories/userMongooseRepository'
import HairdresserRepository from './Data/Repositories/hairdresserMongooseRepository'
import ClientRepository from './Data/Repositories/clientMongooseRepository'
import NotificationRepository from './Data/Repositories/notifTemplateMongooseRepository'
import AppointmentRepository from './Data/Repositories/appointmentMongooseRepository'
import ProfessionalTimesSlotsRepository from './Data/Repositories/proTimeSlotsMongooseRepository'
import DailyHourAvailabilityRepository from './Data/Repositories/dailyHourAMongooseRepository'
import RoleMongooseRepository from './Data/Repositories/roleMongooseRepository'
import NotificationTemplateManager from './Domain/Manager/notificationTemplateManager'
import ServiceMongooseRepository from './Data/Repositories/serviceMongooseRepository'
import ProductoSanityRepository from './Data/Repositories/productoSanityRepository'
import TrabajoSanityRepository from './Data/Repositories/trabajoSanityRepository'
import ImagenSanityRepository from './Data/Repositories/imagenSanityRepository'
const container = createContainer()

container.register({
    UserRepository: asClass(UserRepository, { lifetime: Lifetime.SINGLETON }),
    HairdresserRepository: asClass(HairdresserRepository, { lifetime: Lifetime.SINGLETON }),
    ClientRepository: asClass(ClientRepository, { lifetime: Lifetime.SINGLETON }),
    ServiceRepository:asClass(ServiceMongooseRepository, {lifetime:Lifetime.SINGLETON}),
    NotificationRepository: asClass(NotificationRepository, {lifetime: Lifetime.SINGLETON}),
    AppointmentRepository: asClass(AppointmentRepository, {lifetime: Lifetime.SINGLETON}),
    ProfessionalTimeSlotsRepository: asClass(ProfessionalTimesSlotsRepository,{lifetime: Lifetime.SINGLETON}),
    DailyHourAvailabilityRepository: asClass( DailyHourAvailabilityRepository, {lifetime: Lifetime.SINGLETON}),
    RoleRepository: asClass(RoleMongooseRepository, {lifetime:Lifetime.SINGLETON}),
    NotificationManager: asClass(NotificationTemplateManager, {lifetime: Lifetime.SINGLETON}),
    ProductoRepository: asClass(ProductoSanityRepository, {lifetime: Lifetime.SINGLETON}),
    TrabajoRepository: asClass(TrabajoSanityRepository, {lifetime: Lifetime.SINGLETON}),
    ImagenRepository: asClass(ImagenSanityRepository, {lifetime: Lifetime.SINGLETON})
});




export default container