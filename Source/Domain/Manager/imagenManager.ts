import container from '../../container'
import ImagenSanityRepository from '../../Data/Repositories/imagenSanityRepository'
import { HttpError } from '../../Utils/httpError'

// El mimetype lo declara el cliente: además se chequea la firma real del archivo
const esImagenPermitida = (buffer: Buffer): boolean => {
    const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    const png = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    const webp = buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    return jpeg || png || webp
}

class ImagenManager {
    private imagenRepository: ImagenSanityRepository
    constructor() {
        this.imagenRepository = container.resolve('ImagenRepository')
    }

    async upload(archivo?: Express.Multer.File) {
        if (!archivo) throw new HttpError(400, 'Falta la imagen (campo "imagen")')
        if (!esImagenPermitida(archivo.buffer)) throw new HttpError(400, 'El archivo no es una imagen JPG, PNG o WEBP válida')
        return this.imagenRepository.upload(archivo.buffer, archivo.originalname, archivo.mimetype)
    }

    // Antes de crear/editar: que los assets existan, así Sanity no rechaza la referencia con un 500
    async assertExisten(assetIds: string[]) {
        const unicos = [...new Set(assetIds)]
        const existentes = await this.imagenRepository.countExisting(unicos)
        if (existentes !== unicos.length) throw new HttpError(400, 'Alguna imagen no existe: subila primero a /api/admin/imagenes')
    }

    async deleteIfUnused(assetIds: string[]) {
        for (const assetId of new Set(assetIds)) {
            await this.imagenRepository.deleteIfUnused(assetId)
        }
    }
}

export default ImagenManager
