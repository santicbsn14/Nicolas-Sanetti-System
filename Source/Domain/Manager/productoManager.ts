import container from '../../container'
import ProductoSanityRepository, { ProductoSanityFields } from '../../Data/Repositories/productoSanityRepository'
import ImagenManager from './imagenManager'
import { createProductoValidation, updateProductoValidation, CreateProductoDto } from '../Validations/AdminValidations/productoValidation'
import { reordenarValidation, sanityIdValidation } from '../Validations/AdminValidations/sanityValidation'
import { armarPatch, imagenASanity, nuevaKey, sinVacios, ImagenDto } from '../../Utils/sanityDocs'
import { slugify, slugUnico } from '../../Utils/slugify'
import { HttpError } from '../../Utils/httpError'

const imagenesASanity = (imagenes: ImagenDto[]) => imagenes.map((imagen) => imagenASanity(imagen, true))

const variantesASanity = (variantes: NonNullable<CreateProductoDto['variantes']>) =>
    variantes.map((variante) => ({ _type: 'variante' as const, _key: nuevaKey(), ...variante }))

class ProductoManager {
    private productoRepository: ProductoSanityRepository
    private imagenManager: ImagenManager
    constructor() {
        this.productoRepository = container.resolve('ProductoRepository')
        this.imagenManager = new ImagenManager()
    }

    async getAll() {
        return this.productoRepository.getAll()
    }

    async getById(id: string) {
        await sanityIdValidation.parseAsync(id)
        const producto = await this.productoRepository.getById(id)
        if (!producto) throw new HttpError(404, 'Producto no encontrado')
        return producto
    }

    async create(body: unknown) {
        const datos = await createProductoValidation.parseAsync(body)
        await this.imagenManager.assertExisten(datos.imagenes.map((imagen) => imagen.assetId))

        const base = slugify(datos.nombre) || 'producto'
        const slug = slugUnico(base, await this.productoRepository.getSlugsLike(base))

        const campos = {
            ...sinVacios(datos),
            slug: { _type: 'slug', current: slug },
            imagenes: imagenesASanity(datos.imagenes),
            ...(datos.variantes ? { variantes: variantesASanity(datos.variantes) } : {}),
        } as ProductoSanityFields
        return this.productoRepository.create(campos)
    }

    // El slug no cambia aunque cambie el nombre, para no romper links compartidos
    async update(id: string, body: unknown) {
        await sanityIdValidation.parseAsync(id)
        const datos = await updateProductoValidation.parseAsync(body)
        await this.getById(id)
        if (datos.imagenes) await this.imagenManager.assertExisten(datos.imagenes.map((imagen) => imagen.assetId))

        const { set, unset } = armarPatch({
            ...datos,
            imagenes: datos.imagenes ? imagenesASanity(datos.imagenes) : undefined,
            variantes: datos.variantes ? variantesASanity(datos.variantes) : datos.variantes,
        })
        return this.productoRepository.update(id, set, unset)
    }

    async reorder(body: unknown) {
        const { ids } = await reordenarValidation.parseAsync(body)
        const encontrados = await this.productoRepository.countByIds(ids)
        if (encontrados !== ids.length) throw new HttpError(400, 'Algún id no corresponde a un producto')
        await this.productoRepository.reorder(ids)
        return this.productoRepository.getAll()
    }

    async delete(id: string) {
        const producto = await this.getById(id)
        await this.productoRepository.delete(id)
        await this.imagenManager.deleteIfUnused((producto.imagenes ?? []).map((imagen) => imagen.assetId))
    }
}

export default ProductoManager
