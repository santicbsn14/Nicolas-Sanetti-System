import { describe, it, expect } from 'vitest'
import { createProductoValidation, updateProductoValidation } from '../../Domain/Validations/AdminValidations/productoValidation'
import { createTrabajoValidation, updateTrabajoValidation } from '../../Domain/Validations/AdminValidations/trabajoValidation'
import { reordenarValidation, sanityIdValidation } from '../../Domain/Validations/AdminValidations/sanityValidation'

const imagen = { assetId: 'image-0a1b2c3d4e5f60718293a4b5c6d7e8f901234567-1600x1067-jpg', alt: 'Frasco' }

describe('createProductoValidation', () => {
    it('acepta el mínimo y completa los defaults', () => {
        const datos = createProductoValidation.parse({ nombre: 'Shampoo', imagenes: [imagen] })
        expect(datos.mostrarPrecio).toBe(true)
        expect(datos.activo).toBe(true)
    })

    it('acepta un producto completo', () => {
        const resultado = createProductoValidation.safeParse({
            nombre: '  Shampoo  ',
            descripcion: 'Para todo tipo de cabello',
            imagenes: [imagen, { assetId: imagen.assetId }],
            precio: 15000,
            mostrarPrecio: false,
            variantes: [{ nombre: '250 ml', precio: 9000 }, { nombre: '1 L' }],
            categoria: 'Shampoos',
            activo: false,
            orden: 3,
        })
        expect(resultado.success).toBe(true)
        if (resultado.success) expect(resultado.data.nombre).toBe('Shampoo')
    })

    it.each([
        ['sin nombre', { imagenes: [imagen] }],
        ['nombre vacío', { nombre: '   ', imagenes: [imagen] }],
        ['nombre de más de 80', { nombre: 'a'.repeat(81), imagenes: [imagen] }],
        ['descripción de más de 600', { nombre: 'x', descripcion: 'a'.repeat(601), imagenes: [imagen] }],
        ['sin imágenes', { nombre: 'x', imagenes: [] }],
        ['más de 6 imágenes', { nombre: 'x', imagenes: Array(7).fill(imagen) }],
        ['assetId inválido', { nombre: 'x', imagenes: [{ assetId: 'https://cdn/foto.jpg' }] }],
        ['precio negativo', { nombre: 'x', imagenes: [imagen], precio: -1 }],
        ['precio como string', { nombre: 'x', imagenes: [imagen], precio: '100' }],
        ['variante sin nombre', { nombre: 'x', imagenes: [imagen], variantes: [{ precio: 10 }] }],
        ['variante con precio negativo', { nombre: 'x', imagenes: [imagen], variantes: [{ nombre: 'a', precio: -5 }] }],
        ['campo desconocido (slug)', { nombre: 'x', imagenes: [imagen], slug: 'otro' }],
    ])('rechaza: %s', (_caso, body) => {
        expect(createProductoValidation.safeParse(body).success).toBe(false)
    })
})

describe('updateProductoValidation', () => {
    it('acepta un cambio parcial sin aplicar defaults', () => {
        const datos = updateProductoValidation.parse({ precio: 100 })
        expect(datos).toEqual({ precio: 100 })
    })

    it('acepta null para borrar un opcional', () => {
        expect(updateProductoValidation.safeParse({ descripcion: null, precio: null }).success).toBe(true)
    })

    it('rechaza null en un obligatorio, body vacío y el slug', () => {
        expect(updateProductoValidation.safeParse({ nombre: null }).success).toBe(false)
        expect(updateProductoValidation.safeParse({}).success).toBe(false)
        expect(updateProductoValidation.safeParse({ slug: 'nuevo' }).success).toBe(false)
    })
})

describe('createTrabajoValidation', () => {
    it('acepta el mínimo y completa los defaults', () => {
        const datos = createTrabajoValidation.parse({ imagen, servicio: 'corte-y-barberia' })
        expect(datos.destacado).toBe(false)
        expect(datos.activo).toBe(true)
    })

    it('acepta los tres servicios', () => {
        for (const servicio of ['lavado-y-peinado', 'corte-y-barberia', 'coloracion-y-mechas']) {
            expect(createTrabajoValidation.safeParse({ imagen, servicio }).success).toBe(true)
        }
    })

    it.each([
        ['sin imagen', { servicio: 'corte-y-barberia' }],
        ['sin servicio', { imagen }],
        ['servicio inexistente', { imagen, servicio: 'manicura' }],
        ['descripción de más de 140', { imagen, servicio: 'corte-y-barberia', descripcion: 'a'.repeat(141) }],
        ['destacado no booleano', { imagen, servicio: 'corte-y-barberia', destacado: 'si' }],
        ['campo desconocido', { imagen, servicio: 'corte-y-barberia', foo: 1 }],
    ])('rechaza: %s', (_caso, body) => {
        expect(createTrabajoValidation.safeParse(body).success).toBe(false)
    })
})

describe('updateTrabajoValidation', () => {
    it('acepta un cambio parcial', () => {
        expect(updateTrabajoValidation.parse({ destacado: true })).toEqual({ destacado: true })
    })

    it('rechaza body vacío y servicio inválido', () => {
        expect(updateTrabajoValidation.safeParse({}).success).toBe(false)
        expect(updateTrabajoValidation.safeParse({ servicio: 'otro' }).success).toBe(false)
    })
})

describe('ids y reordenar', () => {
    it('acepta ids de documentos publicados y rechaza drafts', () => {
        expect(sanityIdValidation.safeParse('3f2a9c1e-7b4d-4a8e-9c2f-1d5e6f7a8b9c').success).toBe(true)
        expect(sanityIdValidation.safeParse('drafts.abc').success).toBe(false)
        expect(sanityIdValidation.safeParse('').success).toBe(false)
    })

    it('reordenar exige ids no vacíos y sin repetidos', () => {
        expect(reordenarValidation.safeParse({ ids: ['a', 'b'] }).success).toBe(true)
        expect(reordenarValidation.safeParse({ ids: [] }).success).toBe(false)
        expect(reordenarValidation.safeParse({ ids: ['a', 'a'] }).success).toBe(false)
    })
})
