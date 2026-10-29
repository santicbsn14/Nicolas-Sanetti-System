import container from '../../container'
import TrabajoSanityRepository, { TrabajoSanityFields } from '../../Data/Repositories/trabajoSanityRepository'
import ImagenManager from './imagenManager'
import { createTrabajoValidation, updateTrabajoValidation } from '../Validations/AdminValidations/trabajoValidation'
import { reordenarValidation, sanityIdValidation } from '../Validations/AdminValidations/sanityValidation'
import { armarPatch, imagenASanity, sinVacios } from '../../Utils/sanityDocs'
import { HttpError } from '../../Utils/httpError'

class TrabajoManager {
    private trabajoRepository: TrabajoSanityRepository
    private imagenManager: ImagenManager
    constructor() {
        this.trabajoRepository = container.resolve('TrabajoRepository')
        this.imagenManager = new ImagenManager()
    }

    async getAll() {
        return this.trabajoRepository.getAll()
    }

    async getById(id: string) {
        await sanityIdValidation.parseAsync(id)
        const trabajo = await this.trabajoRepository.getById(id)
        if (!trabajo) throw new HttpError(404, 'Trabajo no encontrado')
        return trabajo
    }

    async create(body: unknown) {
        const datos = await createTrabajoValidation.parseAsync(body)
        await this.imagenManager.assertExisten([datos.imagen.assetId])

        const campos = { ...sinVacios(datos), imagen: imagenASanity(datos.imagen) } as TrabajoSanityFields
        return this.trabajoRepository.create(campos)
    }

    async update(id: string, body: unknown) {
        await sanityIdValidation.parseAsync(id)
        const datos = await updateTrabajoValidation.parseAsync(body)
        await this.getById(id)
        if (datos.imagen) await this.imagenManager.assertExisten([datos.imagen.assetId])

        const { set, unset } = armarPatch({
            ...datos,
            imagen: datos.imagen ? imagenASanity(datos.imagen) : undefined,
        })
        return this.trabajoRepository.update(id, set, unset)
    }

    async reorder(body: unknown) {
        const { ids } = await reordenarValidation.parseAsync(body)
        const encontrados = await this.trabajoRepository.countByIds(ids)
        if (encontrados !== ids.length) throw new HttpError(400, 'Algún id no corresponde a un trabajo')
        await this.trabajoRepository.reorder(ids)
        return this.trabajoRepository.getAll()
    }

    async delete(id: string) {
        const trabajo = await this.getById(id)
        await this.trabajoRepository.delete(id)
        if (trabajo.imagen) await this.imagenManager.deleteIfUnused([trabajo.imagen.assetId])
    }
}

export default TrabajoManager
