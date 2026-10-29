import { randomUUID } from 'crypto'

export interface ImagenDto {
    assetId: string
    alt?: string | null
}

export interface ImagenSanity {
    _type: 'image'
    _key?: string
    asset: { _type: 'reference'; _ref: string }
    alt?: string
}

export const nuevaKey = (): string => randomUUID().replace(/-/g, '').slice(0, 12)

export const esVacio = (valor: unknown): boolean => valor === null || valor === undefined || valor === ''

// { assetId, alt } de la API -> objeto image de Sanity. `_key` solo si va dentro de un array.
export const imagenASanity = (imagen: ImagenDto, dentroDeArray = false): ImagenSanity => ({
    _type: 'image',
    ...(dentroDeArray ? { _key: nuevaKey() } : {}),
    asset: { _type: 'reference', _ref: imagen.assetId },
    ...(esVacio(imagen.alt) ? {} : { alt: imagen.alt as string }),
})

// Separa un body de PATCH en lo que se setea y lo que se borra (null o '')
export const armarPatch = (campos: Record<string, unknown>) => {
    const set: Record<string, unknown> = {}
    const unset: string[] = []
    for (const [campo, valor] of Object.entries(campos)) {
        if (valor === undefined) continue
        if (esVacio(valor)) unset.push(campo)
        else set[campo] = valor
    }
    return { set, unset }
}

// Para crear: descarta los opcionales vacíos
export const sinVacios = <T extends Record<string, unknown>>(campos: T): Partial<T> =>
    Object.fromEntries(Object.entries(campos).filter(([, valor]) => !esVacio(valor))) as Partial<T>
