import sanityClient from '../../Services/sanity'
import customLogger from '../../Services/logger'

export interface ImagenSubida {
    assetId: string
    url: string
    width?: number
    height?: number
}

class ImagenSanityRepository {
    async upload(buffer: Buffer, filename: string, contentType: string): Promise<ImagenSubida> {
        const asset = await sanityClient.assets.upload('image', buffer, { filename, contentType })
        return {
            assetId: asset._id,
            url: asset.url,
            width: asset.metadata?.dimensions?.width,
            height: asset.metadata?.dimensions?.height,
        }
    }

    async countExisting(assetIds: string[]): Promise<number> {
        return sanityClient.fetch<number>(
            'count(*[_type == "sanity.imageAsset" && _id in $assetIds])',
            { assetIds }
        )
    }

    // Si el asset está referenciado por otro documento Sanity no lo deja borrar: se ignora
    async deleteIfUnused(assetId: string): Promise<boolean> {
        try {
            await sanityClient.delete(assetId)
            return true
        } catch (error) {
            customLogger.warn(`No se borró el asset ${assetId}: ${error instanceof Error ? error.message : error}`)
            return false
        }
    }
}

export default ImagenSanityRepository
