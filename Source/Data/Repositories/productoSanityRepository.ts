import sanityClient from '../../Services/sanity'
import { ImagenSanity } from '../../Utils/sanityDocs'

export interface VarianteSanity {
    _type: 'variante'
    _key: string
    nombre: string
    precio?: number
}

export interface ProductoSanityFields {
    nombre: string
    slug: { _type: 'slug'; current: string }
    descripcion?: string
    imagenes: ImagenSanity[]
    precio?: number
    mostrarPrecio: boolean
    variantes?: VarianteSanity[]
    categoria?: string
    activo: boolean
    orden?: number
}

export interface ImagenRespuesta {
    _key?: string
    assetId: string
    alt?: string
    url: string
}

export interface ProductoResumen {
    _id: string
    _createdAt: string
    _updatedAt: string
    nombre: string
    slug: string
    precio?: number
    mostrarPrecio?: boolean
    categoria?: string
    activo?: boolean
    orden?: number
    imagen: ImagenRespuesta | null
    cantidadImagenes: number
}

export interface Producto extends Omit<ProductoResumen, 'imagen' | 'cantidadImagenes'> {
    descripcion?: string
    imagenes: ImagenRespuesta[]
    variantes?: { _key: string; nombre: string; precio?: number }[]
}

const PROYECCION_RESUMEN = `{
    _id, _createdAt, _updatedAt, nombre, "slug": slug.current, precio, mostrarPrecio, categoria, activo, orden,
    "imagen": imagenes[0]{ "assetId": asset._ref, alt, "url": asset->url },
    "cantidadImagenes": count(imagenes)
}`

const PROYECCION_COMPLETA = `{
    _id, _createdAt, _updatedAt, nombre, "slug": slug.current, descripcion,
    "imagenes": imagenes[]{ _key, "assetId": asset._ref, alt, "url": asset->url },
    precio, mostrarPrecio, "variantes": variantes[]{ _key, nombre, precio }, categoria, activo, orden
}`

class ProductoSanityRepository {
    async getAll(): Promise<ProductoResumen[]> {
        return sanityClient.fetch(`*[_type == "producto"] | order(orden asc, _createdAt desc) ${PROYECCION_RESUMEN}`)
    }

    async getById(id: string): Promise<Producto | null> {
        return sanityClient.fetch(`*[_type == "producto" && _id == $id][0] ${PROYECCION_COMPLETA}`, { id })
    }

    // Slugs iguales a `base` o de la forma `base-N`
    async getSlugsLike(base: string): Promise<string[]> {
        return sanityClient.fetch(
            '*[_type == "producto" && (slug.current == $base || string::startsWith(slug.current, $prefijo))].slug.current',
            { base, prefijo: `${base}-` }
        )
    }

    async countByIds(ids: string[]): Promise<number> {
        return sanityClient.fetch('count(*[_type == "producto" && _id in $ids])', { ids })
    }

    async create(campos: ProductoSanityFields): Promise<Producto | null> {
        const creado = await sanityClient.create({ _type: 'producto', ...campos })
        return this.getById(creado._id)
    }

    async update(id: string, set: Record<string, unknown>, unset: string[]): Promise<Producto | null> {
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

export default ProductoSanityRepository
