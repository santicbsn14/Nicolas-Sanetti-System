const MAX_LARGO = 96

// "Shampoo Ñandú 500ml!" -> "shampoo-nandu-500ml"
export const slugify = (texto: string): string =>
    texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // tildes, diéresis y la virgulilla de la ñ
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, MAX_LARGO)
        .replace(/-+$/, '')

// Si `base` ya está usado, prueba base-2, base-3...
export const slugUnico = (base: string, existentes: string[]): string => {
    const usados = new Set(existentes)
    if (!usados.has(base)) return base
    let n = 2
    while (usados.has(`${base}-${n}`)) n++
    return `${base}-${n}`
}
