# Avance 06 — Back: admin con Firebase + escritura en Sanity

> ⚠️ **Deploy pendiente.** Se pusheó a `main` sin cargar las variables de Sanity en Render (tema de facturación de la cuenta, lo resuelve el cliente). Ver Pendientes.

## Qué se hizo

- Endpoints `/api/admin/*` para productos, trabajos e imágenes, que escriben en Sanity (proyecto `6j2h7mq3`, dataset `production`). Todos pasan por `requireAdmin`.
- `requireAdmin`: valida el ID token de Firebase (`Authorization: Bearer`) y exige el custom claim `admin: true`. No usa Mongo ni los roles viejos.
- Cliente de escritura de Sanity en `Source/Services/sanity.ts` (`useCdn: false`, `perspective: 'published'`, con token). Si falta alguna de las 4 variables, el server no arranca y el error dice cuáles faltan.
- Scripts `scripts/set-admin.mjs` (dar/sacar admin) y `scripts/get-id-token.mjs` (token para pruebas locales).
- Token de escritura `back-render` (rol Editor) creado con `npx sanity tokens add "back-render" --role=editor` desde `studio/` del front. Está **solo** en el `.env` local del back.
- `santicbsn9@gmail.com` tiene `admin: true`. El usuario no existía en Firebase Auth: lo creó el script y se le pasó a Santiago el link para definir la contraseña.
- Tests nuevos (51): `requireAdmin`, slug, validaciones Zod de producto/trabajo/reordenar y `ProductoManager` con repositorios mockeados.

## Endpoints

Todos requieren `Authorization: Bearer <idToken>` de un usuario con claim `admin`. Sin token o token inválido/vencido → **401**; sin claim → **403**. Ruta inexistente bajo `/api/admin` (con token válido) → 404.

Formato de imagen que recibe la API: `{ "assetId": "image-…-jpg", "alt"?: string }`.

### Imágenes

| Método | Ruta | Body | Respuestas |
|---|---|---|---|
| POST | `/api/admin/imagenes` | multipart, campo `imagen` (JPG, PNG o WEBP, máx. 10 MB) | **201** `{ assetId, url, width, height }` · 400 formato no permitido, sin archivo, campo equivocado o contenido que no es imagen · 413 más de 10 MB |

### Productos — `/api/admin/productos`

| Método | Ruta | Body | Respuestas |
|---|---|---|---|
| GET | `/` | — | **200** array con todos (activos e inactivos), orden `orden asc, _createdAt desc`. Cada uno: `_id, _createdAt, _updatedAt, nombre, slug, precio, mostrarPrecio, categoria, activo, orden, imagen { assetId, alt, url }, cantidadImagenes` |
| GET | `/:id` | — | **200** completo, con `imagenes[] { _key, assetId, alt, url }` y `variantes[] { _key, nombre, precio }` · 404 |
| POST | `/` | `nombre` (req, ≤ 80), `descripcion?` (≤ 600), `imagenes` (1 a 6), `precio?` (≥ 0), `mostrarPrecio` (default true), `variantes?` (`{ nombre, precio? }`), `categoria?`, `activo` (default true), `orden?` | **201** producto completo · 400 validación o imagen inexistente |
| PATCH | `/:id` | Mismos campos, todos opcionales. `null` (o `''`) en un opcional lo borra. Al menos un campo | **200** producto completo · 400 · 404 |
| POST | `/reordenar` | `{ ids: string[] }` (sin repetidos) | **200** lista actualizada · 400 si algún id no es un producto |
| DELETE | `/:id` | — | **204** · 404 |

El slug se genera en el server a partir del nombre (minúsculas, sin tildes, ñ → n, guiones; si existe, `-2`, `-3`…). **No cambia** al editar el nombre. No se acepta `slug` en el body.

### Trabajos — `/api/admin/trabajos`

Mismos endpoints y status que productos (sin slug). Body: `imagen` (req), `servicio` (req: `lavado-y-peinado` | `corte-y-barberia` | `coloracion-y-mechas`), `descripcion?` (≤ 140), `destacado` (default false), `activo` (default true), `orden?`. Respuesta: `_id, _createdAt, _updatedAt, imagen { assetId, alt, url }, servicio, descripcion, destacado, activo, orden`.

Errores de validación Zod → `400 { message: "Validation error", details: [...] }`. Resto de errores propios → `{ message }`.

## Cómo dar admin a alguien

```bash
node scripts/set-admin.mjs persona@mail.com           # admin: true (si no existe, la crea e imprime un link para que defina su contraseña)
node scripts/set-admin.mjs persona@mail.com --remove  # saca el claim
```

Se corre desde la raíz del back, con `firebase.key.json` ahí. Conserva los otros claims que tenga el usuario. **El cambio se ve recién cuando la persona cierra sesión y vuelve a entrar** (o se refresca su token, como mucho en 1 hora).

## Archivos creados o modificados

| Archivo | Cambio |
|---|---|
| `package.json`, `package-lock.json` | `@sanity/client`, `multer`, `@types/multer` (dev) |
| `.env.example` | 4 variables de Sanity, sin valores |
| `Source/Services/sanity.ts` | Nuevo: cliente de escritura |
| `Source/Presentation/Middlewares/requireAdmin.ts` | Nuevo |
| `Source/Presentation/Middlewares/uploadImagen.ts` | Nuevo: multer en memoria + traducción de errores a 400/413 |
| `Source/Presentation/Middlewares/errorHandler.ts` | `HttpError` y JSON mal formado (ver Desvíos) |
| `Source/Data/Repositories/productoSanityRepository.ts`, `trabajoSanityRepository.ts`, `imagenSanityRepository.ts` | Nuevos |
| `Source/Domain/Manager/productoManager.ts`, `trabajoManager.ts`, `imagenManager.ts` | Nuevos |
| `Source/Domain/Validations/AdminValidations/` | Nuevo: `productoValidation.ts`, `trabajoValidation.ts`, `sanityValidation.ts` (ids, imagen, reordenar) |
| `Source/Presentation/Controller/productoController.ts`, `trabajoController.ts`, `imagenController.ts` | Nuevos |
| `Source/Presentation/Routes/productoRouter.ts`, `trabajoRouter.ts`, `imagenRouter.ts` | Nuevos |
| `Source/Utils/slugify.ts`, `sanityDocs.ts`, `httpError.ts` | Nuevos |
| `Source/Presentation/Application/appExpress.ts` | `requireAdmin` en `/api/admin` + los 3 routers, antes del 404 |
| `Source/container.ts` | `ProductoRepository`, `TrabajoRepository`, `ImagenRepository` |
| `global.d.ts` | `req.admin` tipado en `Express.Request` |
| `scripts/set-admin.mjs`, `scripts/get-id-token.mjs` | Nuevos |
| `Source/Tests/Admin/*.test.ts` | 4 archivos de tests nuevos |
| `docs/avances/06-back-admin-sanity.md` | Este archivo |

## Decisiones durante la implementación

- **`requireAdmin` se monta una vez** con `app.use('/api/admin', requireAdmin)`, así cualquier ruta nueva bajo `/api/admin` queda protegida por defecto. Exige `admin === true` estricto (un `"true"` string da 403). `next()` se llama fuera del `try`, para que un error de una ruta no se confunda con un error de auth.
- **IDs**: los generan Sanity al crear (documentos publicados, sin `drafts.`). Los `:id` se validan con un regex sin puntos, así no se puede apuntar a `drafts.*` ni a documentos de sistema. Un id de trabajo en `/productos/:id` da 404 (las queries filtran por `_type`).
- **Imágenes**: además del mimetype que declara el cliente, se chequea la firma real del archivo (JPG/PNG/WEBP). Antes de crear o editar se verifica que los `assetId` existan en Sanity; si no, 400 en vez de un 500 por referencia rota.
- **PATCH**: `null` o `''` en un campo opcional hace `unset` en Sanity. Pensado para que el panel pueda vaciar descripción, precio, etc. `imagenes` y `variantes` se reemplazan enteros.
- **Body estricto**: Zod con `.strict()`, así campos desconocidos (`slug`, `_id`…) dan 400 en vez de ignorarse en silencio.
- **DELETE**: borra el documento y su borrador del Studio (`drafts.<id>`) en una transacción, y después intenta borrar cada asset. Si otro documento lo usa, Sanity lo rechaza y se loguea como warning.
- **Reordenar** devuelve la lista actualizada (200) para que el panel no tenga que pedirla de nuevo. Antes de la transacción se verifica que todos los ids sean del tipo correcto.
- **Respuestas de listado**: array plano, no el `{ status, docs, ... }` paginado del sistema viejo. Son pocos documentos.
- `alt` y `categoria` no tienen límite de largo, igual que en el schema del Studio.

## Desvíos respecto al brief

- **Push sin variables en Render y sin verificar producción**, por decisión de Santiago (facturación de la cuenta). Ver Pendientes.
- **`errorHandler.ts` modificado** (no estaba en la lista): se agregó al principio el manejo de `HttpError` (status propio para 400/404/413) y de JSON mal formado (`entity.parse.failed` → 400; antes daba 500). El resto del handler no se tocó.
- **Prueba real con usuarios temporales**: `santicbsn9@gmail.com` no existía, así que no tenía contraseña para sacar un token. Para no frenar la prueba se crearon dos usuarios temporales con contraseña aleatoria (uno al que se le dio admin con `set-admin.mjs`, y otro sin claim para el 403). Se obtuvieron sus tokens con `get-id-token.mjs`, se probó `set-admin.mjs --remove` sobre el admin temporal y después se borraron los dos.
- **Test extra** de `ProductoManager` con repositorios y cliente de Sanity mockeados (slug duplicado, armado de imágenes, `unset`, 404, borrado de assets).

## Pendientes o problemas

- **Deploy del back pendiente hasta cargar las 4 variables de Sanity en Render** (servicio del back → Environment): `SANITY_PROJECT_ID=6j2h7mq3`, `SANITY_DATASET=production`, `SANITY_API_VERSION=2025-02-19` y `SANITY_WRITE_TOKEN` (está en el `.env` local del back, línea `SANITY_WRITE_TOKEN`). Sin ellas el server tira `Faltan variables de entorno de Sanity` al arrancar, así que el deploy automático de este push va a fallar. Después de cargarlas: hacer un redeploy manual y verificar `GET https://nicolas-sanetti-system.onrender.com/api/health` → 200 y `GET .../api/admin/productos` sin token → 401.
- **Assets huérfanos**: si se sube una imagen y no se usa en ningún producto o trabajo (por ejemplo, se cancela el formulario), queda en Sanity. Se podría sumar más adelante un endpoint o un script de limpieza.
- **Assets compartidos**: Sanity deduplica las imágenes por contenido. Si dos documentos usan la misma foto, borrar uno no borra la imagen (correcto), pero conviene tenerlo en cuenta al probar: las fotos de `04a-material` son las mismas que usan los documentos "PRUEBA" del brief 05.
- Siguen los 12 tests que ya fallaban (ver avance 00), ni más ni menos: `12 failed | 159 passed`.
- En Git Bash de Windows, `curl -d '...ñ...'` manda bytes que no son UTF-8 y el nombre llega roto. No es del server: con `--data-binary @archivo.json` (UTF-8) llega bien.

## Cómo probarlo

```bash
npm run build
npm test                 # 12 fallos previos, 159 ok
node dist/index.js       # con .env completo y firebase.key.json
# si Mongo falla con querySrv ECONNREFUSED, ver el arreglo de DNS en el avance 00
```

Token de prueba (dura 1 hora):

```bash
FIREBASE_WEB_API_KEY=<VITE_API_KEY_FIREBASE del .env del front> \
  node scripts/get-id-token.mjs <email-admin> <password> > token.txt
T=$(cat token.txt)
```

Verificaciones (resultado obtenido en local contra Sanity real):

```bash
curl -i localhost:8080/api/admin/productos                         # 401 No autenticado
curl -i -H "Authorization: Bearer abc" localhost:8080/api/admin/productos   # 401 Sesión inválida o vencida
# con token de un usuario sin claim                                 # 403
curl -i localhost:8080/api/users                                    # 404

curl -H "Authorization: Bearer $T" -F "imagen=@foto.jpg;type=image/jpeg" \
  localhost:8080/api/admin/imagenes                                 # 201 { assetId, url, width, height }
curl -H "Authorization: Bearer $T" -F "imagen=@x.gif;type=image/gif" \
  localhost:8080/api/admin/imagenes                                 # 400

curl -H "Authorization: Bearer $T" -H "Content-Type: application/json" \
  --data-binary @producto.json localhost:8080/api/admin/productos   # 201 (slug generado)
curl -H "Authorization: Bearer $T" localhost:8080/api/admin/productos            # 200
curl -X PATCH -H "Authorization: Bearer $T" -H "Content-Type: application/json" \
  -d '{"precio":999,"descripcion":null}' localhost:8080/api/admin/productos/<id> # 200, slug igual
curl -H "Authorization: Bearer $T" -H "Content-Type: application/json" \
  -d '{"ids":["<id2>","<id1>"]}' localhost:8080/api/admin/productos/reordenar    # 200
curl -X DELETE -H "Authorization: Bearer $T" localhost:8080/api/admin/productos/<id>  # 204
```

Mientras el producto existe y está activo, aparece en el CDN público:
`https://6j2h7mq3.apicdn.sanity.io/v2025-02-19/data/query/production?query=*[_type=="producto"]`.
