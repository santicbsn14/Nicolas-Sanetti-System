import sanityClient from '../../Services/sanity'
import { ImagenSanity } from '../../Utils/sanityDocs'
import { ImagenRespuesta } from './productoSanityRepository'

export interface TrabajoSanityFields {
    imagen: ImagenSanity
    servicio: string
    descripcion?: string
    destacado: boolean
    activo: boolean
    orden?: number
}

export interface Trabajo {
    _id: string
    _createdAt: string
    _updatedAt: string
    imagen: ImagenRespuesta | null
    servicio: string
    descripcion?: string
    destacado?: boolean
    activo?: boolean
    orden?: number
}

const PROYECCION = `{
    _id, _createdAt, _updatedAt,
    "imagen": imagen{ "assetId": asset._ref, alt, "url": asset->url },
    servicio, descripcion, destacado, activo, orden
}`

class TrabajoSanityRepository {
    async getAll(): Promise<Trabajo[]> {
        return sanityClient.fetch(`*[_type == "trabajo"] | order(orden asc, _createdAt desc) ${PROYECCION}`)
    }

    async getById(id: string): Promise<Trabajo | null> {
        return sanityClient.fetch(`*[_type == "trabajo" && _id == $id][0] ${PROYECCION}`, { id })
    }

    async countByIds(ids: string[]): Promise<number> {
        return sanityClient.fetch('count(*[_type == "trabajo" && _id in $ids])', { ids })
    }

    async create(campos: TrabajoSanityFields): Promise<Trabajo | null> {
        const creado = await sanityClient.create({ _type: 'trabajo', ...campos })
        return this.getById(creado._id)
    }

    async update(id: string, set: Record<string, unknown>, unset: string[]): Promise<Trabajo | null> {
        let patch = sanityClient.patch(id)
        if (Object.keys(set).length > 0) patch = patch.set(set)
        if (unset.length > 0) patch = patch.unset(unset)
        await patch.commit()
        return this.getById(id)
    }

    async reorder(ids: string[]): Promise<void> {
        const transaccion = sanityClient.transaction()
        ids.forEach((id, indice) => transaccion.patch(id, { set: { orden: indice } }))
        await transaccion.commit()
    }

    // Borra también el borrador que pueda haber dejado el Studio
    async delete(id: string): Promise<void> {
        await sanityClient.transaction().delete(id).delete(`drafts.${id}`).commit()
    }
}

export default TrabajoSanityRepository
