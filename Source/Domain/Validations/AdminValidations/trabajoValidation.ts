import { z } from 'zod'
import { imagenValidation, textoOpcional } from './sanityValidation'

// Mismas reglas que studio/schemaTypes/trabajo.ts del front
export const SERVICIOS = ['lavado-y-peinado', 'corte-y-barberia', 'coloracion-y-mechas'] as const

const campos = {
    imagen: imagenValidation,
    servicio: z.enum(SERVICIOS),
    descripcion: textoOpcional(140),
    destacado: z.boolean(),
    activo: z.boolean(),
    orden: z.number().nullable().optional(),
}

export const createTrabajoValidation = z.object({
    ...campos,
    destacado: campos.destacado.default(false),
    activo: campos.activo.default(true),
}).strict()

export const updateTrabajoValidation = z.object(campos).partial().strict()
    .refine((body) => Object.keys(body).length > 0, 'No hay campos para actualizar')

export type CreateTrabajoDto = z.infer<typeof createTrabajoValidation>
export type UpdateTrabajoDto = z.infer<typeof updateTrabajoValidation>
