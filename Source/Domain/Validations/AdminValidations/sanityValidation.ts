import { z } from 'zod'

// IDs de documentos publicados: sin puntos, así no se puede apuntar a drafts.* ni a documentos del sistema
export const sanityIdValidation = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/, 'ID inválido')

// Formato de los assets de imagen de Sanity: image-<hash>-<ancho>x<alto>-<formato>
export const imagenValidation = z.object({
    assetId: z.string().regex(/^image-[a-f0-9]+-\d+x\d+-[a-z]+$/, 'assetId inválido'),
    alt: z.string().trim().nullable().optional(),
}).strict()

// En PATCH, null (o '') en un campo opcional lo borra del documento
export const textoOpcional = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`).nullable().optional()

export const reordenarValidation = z.object({
    ids: z.array(sanityIdValidation).min(1, 'Mandá al menos un id')
        .refine((ids) => new Set(ids).size === ids.length, 'Hay ids repetidos'),
}).strict()
