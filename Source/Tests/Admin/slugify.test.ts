import { describe, it, expect } from 'vitest'
import { slugify, slugUnico } from '../../Utils/slugify'

describe('slugify', () => {
    it('pasa a minúsculas y cambia espacios por guiones', () => {
        expect(slugify('Shampoo Reparador')).toBe('shampoo-reparador')
    })

    it('saca tildes y diéresis', () => {
        expect(slugify('Acondicionador Nutrición Pingüino')).toBe('acondicionador-nutricion-pinguino')
        expect(slugify('ÁÉÍÓÚ')).toBe('aeiou')
    })

    it('cambia ñ por n', () => {
        expect(slugify('Peine Ñandú año')).toBe('peine-nandu-ano')
    })

    it('reemplaza símbolos y colapsa guiones', () => {
        expect(slugify('Cera  "Mate" 100ml / x2!!')).toBe('cera-mate-100ml-x2')
        expect(slugify('Kit & Co. — edición 2026')).toBe('kit-co-edicion-2026')
    })

    it('no deja guiones al principio ni al final', () => {
        expect(slugify('  -¡Oferta!-  ')).toBe('oferta')
    })

    it('devuelve vacío si no queda nada usable', () => {
        expect(slugify('!!! ???')).toBe('')
    })

    it('corta en 96 caracteres sin dejar guion al final', () => {
        const slug = slugify(`${'a'.repeat(95)} b`)
        expect(slug.length).toBeLessThanOrEqual(96)
        expect(slug.endsWith('-')).toBe(false)
    })
})

describe('slugUnico', () => {
    it('devuelve la base si no está usada', () => {
        expect(slugUnico('shampoo', [])).toBe('shampoo')
        expect(slugUnico('shampoo', ['shampoo-reparador'])).toBe('shampoo')
    })

    it('agrega -2 si la base ya existe', () => {
        expect(slugUnico('shampoo', ['shampoo'])).toBe('shampoo-2')
    })

    it('sigue con -3, -4... y rellena huecos', () => {
        expect(slugUnico('shampoo', ['shampoo', 'shampoo-2'])).toBe('shampoo-3')
        expect(slugUnico('shampoo', ['shampoo', 'shampoo-3'])).toBe('shampoo-2')
    })
})
