import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProductoManager from '../../Domain/Manager/productoManager'

const mockProductoRepository = {
    getAll: vi.fn(),
    getById: vi.fn(),
    getSlugsLike: vi.fn(),
    countByIds: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    reorder: vi.fn(),
    delete: vi.fn(),
}

const mockImagenRepository = {
    upload: vi.fn(),
    countExisting: vi.fn(),
    deleteIfUnused: vi.fn(),
}

vi.mock('../../container', () => ({
    default: {
        resolve: vi.fn((nombre: string) => (nombre === 'ImagenRepository' ? mockImagenRepository : mockProductoRepository)),
    },
}))

// El repositorio real importa el cliente de Sanity: que no se cree nunca en los tests
vi.mock('../../Services/sanity', () => ({ default: {} }))

const assetId = 'image-0a1b2c3d4e5f60718293a4b5c6d7e8f901234567-1600x1067-jpg'

describe('ProductoManager', () => {
    let manager: ProductoManager

    beforeEach(() => {
        vi.clearAllMocks()
        manager = new ProductoManager()
        mockImagenRepository.countExisting.mockResolvedValue(1)
    })

    it('create genera el slug, evita duplicados y arma las imágenes para Sanity', async () => {
        mockProductoRepository.getSlugsLike.mockResolvedValue(['cera-mate', 'cera-mate-2'])
        await manager.create({ nombre: 'Cera Maté', imagenes: [{ assetId, alt: 'Frasco' }], descripcion: '' })

        expect(mockProductoRepository.getSlugsLike).toHaveBeenCalledWith('cera-mate')
        const campos = mockProductoRepository.create.mock.calls[0][0]
        expect(campos.slug).toEqual({ _type: 'slug', current: 'cera-mate-3' })
        expect(campos.mostrarPrecio).toBe(true)
        expect(campos.activo).toBe(true)
        expect(campos).not.toHaveProperty('descripcion')
        expect(campos.imagenes).toEqual([
            { _type: 'image', _key: expect.any(String), asset: { _type: 'reference', _ref: assetId }, alt: 'Frasco' },
        ])
    })

    it('create rechaza con 400 si la imagen no existe en Sanity', async () => {
        mockImagenRepository.countExisting.mockResolvedValue(0)
        await expect(manager.create({ nombre: 'X', imagenes: [{ assetId }] })).rejects.toMatchObject({ status: 400 })
        expect(mockProductoRepository.create).not.toHaveBeenCalled()
    })

    it('update no toca el slug y borra los opcionales en null', async () => {
        mockProductoRepository.getById.mockResolvedValue({ _id: 'p1', imagenes: [] })
        await manager.update('p1', { nombre: 'Otro nombre', descripcion: null })
        expect(mockProductoRepository.update).toHaveBeenCalledWith('p1', { nombre: 'Otro nombre' }, ['descripcion'])
    })

    it('getById tira 404 si no existe', async () => {
        mockProductoRepository.getById.mockResolvedValue(null)
        await expect(manager.getById('no-existe')).rejects.toMatchObject({ status: 404 })
    })

    it('delete borra el documento y después intenta borrar sus assets', async () => {
        mockProductoRepository.getById.mockResolvedValue({ _id: 'p1', imagenes: [{ assetId }, { assetId }] })
        await manager.delete('p1')
        expect(mockProductoRepository.delete).toHaveBeenCalledWith('p1')
        expect(mockImagenRepository.deleteIfUnused).toHaveBeenCalledTimes(1)
        expect(mockImagenRepository.deleteIfUnused).toHaveBeenCalledWith(assetId)
    })

    it('reorder rechaza ids que no son productos', async () => {
        mockProductoRepository.countByIds.mockResolvedValue(1)
        await expect(manager.reorder({ ids: ['a', 'b'] })).rejects.toMatchObject({ status: 400 })
        expect(mockProductoRepository.reorder).not.toHaveBeenCalled()
    })
})
