import { z } from 'zod'
import { imagenValidation, textoOpcional } from './sanityValidation'

// Mismas reglas que studio/schemaTypes/producto.ts del front
const varianteValidation = z.object({
    nombre: z.string().trim().min(1, 'La variante necesita un nombre'),
    precio: z.number().min(0, 'El precio no puede ser negativo').optional(),
}).strict()

const campos = {
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
    descripcion: textoOpcional(600),
    imagenes: z.array(imagenValidation).min(1, 'Cargá al menos una imagen').max(6, 'Máximo 6 imágenes'),
    precio: z.number().min(0, 'El precio no puede ser negativo').nullable().optional(),
    mostrarPrecio: z.boolean(),
    variantes: z.array(varianteValidation).nullable().optional(),
    categoria: z.string().trim().nullable().optional(),
    activo: z.boolean(),
    orden: z.number().nullable().optional(),
}

export const createProductoValidation = z.object({
    ...campos,
    mostrarPrecio: campos.mostrarPrecio.default(true),
    activo: campos.activo.default(true),
}).strict()

export const updateProductoValidation = z.object(campos).partial().strict()
    .refine((body) => Object.keys(body).length > 0, 'No hay campos para actualizar')

export type CreateProductoDto = z.infer<typeof createProductoValidation>
export type UpdateProductoDto = z.infer<typeof updateProductoValidation>
