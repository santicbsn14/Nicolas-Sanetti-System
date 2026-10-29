// Da (o saca) permisos de admin del panel /admin a un usuario de Firebase Auth.
//
//   node scripts/set-admin.mjs <email>            -> admin: true (crea el usuario si no existe)
//   node scripts/set-admin.mjs <email> --remove   -> saca el claim admin
//
// Usa firebase.key.json de la raíz del repo.
import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const args = process.argv.slice(2)
const quitar = args.includes('--remove')
const email = args.find((arg) => !arg.startsWith('--'))

if (!email || !email.includes('@')) {
    console.error('Uso: node scripts/set-admin.mjs <email> [--remove]')
    process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(new URL('../firebase.key.json', import.meta.url), 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
const auth = getAuth()

let usuario
let creado = false
let linkPassword

try {
    usuario = await auth.getUserByEmail(email)
} catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error
    if (quitar) {
        console.log(`${email} no existe en Firebase Auth: no hay nada que sacar.`)
        process.exit(0)
    }
    // Sin contraseña conocida: la define la persona con el link de restablecimiento
    usuario = await auth.createUser({ email })
    creado = true
    linkPassword = await auth.generatePasswordResetLink(email)
}

const claims = { ...(usuario.customClaims ?? {}) }
if (quitar) delete claims.admin
else claims.admin = true

await auth.setCustomUserClaims(usuario.uid, Object.keys(claims).length > 0 ? claims : null)

console.log('')
console.log(`Usuario:  ${email} (uid ${usuario.uid})${creado ? ' — CREADO ahora' : ''}`)
console.log(`Admin:    ${quitar ? 'NO (claim quitado)' : 'SÍ'}`)
console.log(`Claims:   ${JSON.stringify(claims)}`)
if (linkPassword) {
    console.log('')
    console.log('Link para que defina su contraseña (mandáselo a la persona):')
    console.log(linkPassword)
}
console.log('')
console.log('IMPORTANTE: el cambio se ve recién cuando el usuario cierra sesión y vuelve a entrar')
console.log('(o cuando se refresca su ID token, como mucho en 1 hora).')
process.exit(0)
