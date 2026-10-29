// SOLO PARA PRUEBAS LOCALES: imprime un ID token de Firebase para usar con curl.
//
//   FIREBASE_WEB_API_KEY=<VITE_API_KEY_FIREBASE del front> node scripts/get-id-token.mjs <email> <password>
//   curl -H "Authorization: Bearer $(...)" localhost:$PORT/api/admin/productos
//
// El token dura 1 hora.
const [email, password] = process.argv.slice(2)
const apiKey = process.env.FIREBASE_WEB_API_KEY

if (!email || !password) {
    console.error('Uso: FIREBASE_WEB_API_KEY=... node scripts/get-id-token.mjs <email> <password>')
    process.exit(1)
}
if (!apiKey) {
    console.error('Falta la variable FIREBASE_WEB_API_KEY (es VITE_API_KEY_FIREBASE del .env del front).')
    process.exit(1)
}

const respuesta = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
})
const datos = await respuesta.json()

if (!respuesta.ok) {
    console.error(`No se pudo iniciar sesión: ${datos?.error?.message ?? respuesta.status}`)
    process.exit(1)
}

console.log(datos.idToken)
