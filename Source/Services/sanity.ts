import dotenv from 'dotenv'
dotenv.config()
import { createClient } from '@sanity/client'

// Cliente de ESCRITURA: el token nunca sale del servidor. La web pública lee directo del CDN de Sanity.
const VARIABLES = ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_VERSION', 'SANITY_WRITE_TOKEN']

const faltantes = VARIABLES.filter((nombre) => !process.env[nombre])
if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno de Sanity: ${faltantes.join(', ')}. Ver .env.example.`)
}

const sanityClient = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: process.env.SANITY_API_VERSION,
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
    perspective: 'published',
})

export default sanityClient
