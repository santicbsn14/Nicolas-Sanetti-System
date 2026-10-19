# Avance 00 — Blindaje del back

> ⚠️ **Una vez deployado, el panel de turnos del front deja de funcionar.** Es esperado: todas las rutas que usaba ahora devuelven 404. El panel se oculta en el brief 01.

## Qué se hizo

- Tag `v1-con-turnos` creado sobre `75aa2ba` (estado previo a este brief) y pusheado a `origin`.
- Se desmontaron **todos** los routers del sistema de turnos (appointments, hairdresser, session, users, roles, clients, service, notificationTemplate, dailyHourAvailability, professionalTimeSlots). Los archivos siguen en el repo; solo se sacó el montaje y los imports.
- Nuevo `GET /api/health` → `200 { status: 'ok' }`, sin tocar la DB.
- Cualquier `/api/*` no definido responde `404 { message: 'Not found' }` (antes del `errorHandler`).
- Se eliminó el cron de recordatorios (`node-cron` + `AppointmentManager`) de `connectDb()`. La conexión a Mongo se mantiene.
- Se eliminó la instancia duplicada de `AppExpress` del final de `appExpress.ts`. Ahora la única instancia es la que crea `AppFactory` desde `index.ts`, así que la conexión a la DB y los `process.on` se registran una sola vez.
- CORS lee los orígenes de `CORS_ORIGINS` (lista separada por comas). Default: `http://localhost:5173,https://nicolas-sanetti-front.vercel.app`.
- Se eliminó el método `listen()`, que no se usaba y duplicaba a `start()`.
- `npm start` ahora es `node dist/index.js` (sin `--watch`).
- Los tests de Supertest se excluyen de vitest.
- `coverage/` y `*.log` al `.gitignore`, y se dejaron de trackear (`git rm --cached`).
- Nuevo `.env.example`.

## Archivos creados o modificados

| Archivo | Cambio |
|---|---|
| `Source/Presentation/Application/appExpress.ts` | Routers y cron fuera, health check, 404 JSON, CORS por env, sin instancia duplicada ni `listen()` |
| `package.json` | Script `start` sin `--watch` |
| `vitest.config.ts` | Excluye `Source/Tests/Supertest/**` (con comentario) |
| `tsconfig.json` | Excluye `Source/Tests/Supertest` (ver desvíos) |
| `.gitignore` | `coverage/`, `*.log` |
| `.env.example` | Nuevo |
| `coverage/`, `combined.log`, `error.log`, `info.log` | Sacados del índice de git (siguen en disco) |
| `docs/avances/00-blindaje-back.md` | Este archivo |

## Decisiones durante la implementación

- **404 JSON**: se implementó con `app.use('/api', ...)` después de las rutas, así atrapa cualquier método y subruta de `/api`. Rutas fuera de `/api` siguen con el 404 por defecto de Express.
- **CORS**: se hace `trim()` de cada origen y se descartan vacíos, para tolerar `CORS_ORIGINS="a, b,"`. Si `CORS_ORIGINS` está definida pero vacía, se usa el default.
- **`.env.example`**: no incluye `FIREBASE_API_KEY` (el `.env` local la tiene) porque solo la usan los tests de Supertest, que quedaron excluidos. Tampoco incluye `PRIVATE_KEY` ni `FIREBASE_SERVICE_ACCOUNT`, que están en el `.env` local pero el código no los lee. `VERCEL` la usa `start()`, pero la define la plataforma y no hace falta en Render.
- `node-cron` sigue en `package.json`: el brief pedía sacar el import, no la dependencia.

## Desvíos respecto al brief

- **`tsconfig.json` modificado** (no estaba en la lista de archivos). `tsc` compila todo `Source/**/*`, incluidos los tests de Supertest, que importan `{ app }` de `appExpress.ts`. Al eliminar esa instancia, `npm run build` fallaba con `TS2614` en los 6 archivos de Supertest. Se agregó `"Source/Tests/Supertest"` al `exclude` de `tsconfig.json`. No se tocaron los tests ni `index.ts`.
- La línea base de tests no se corrió en un worktree aparte, sino en el working tree con HEAD en el commit del tag y antes de cualquier cambio (el único cambio local eran los `.log`). El resultado es equivalente.

## Pendientes o problemas

- **Tests de Managers/Repositories: 12 fallos que ya existían.** En el tag `v1-con-turnos` (antes de los cambios) y después de los cambios el resultado es idéntico: `11 failed | 7 passed` archivos, `12 failed | 108 passed` tests. No se arreglaron. Detalle:
  - `sessionManager.test.ts`: no contiene tests ("No test suite found").
  - Managers con 1 fallo cada uno: `appointmentManager`, `clientManager`, `dailyHourAManager`, `hairdresserManager`, `proTimeSlots` (ZodError: `start_time`/`end_time` esperan string), `serviceManager`, `userManager` (`Cannot read properties of undefined (reading 'createUser')`).
  - Repositories: `appointmentRepository` (3), `clientRepository` (1), `haidresserRepository` (1).
- **DNS de Node en esta máquina**: al levantar local, Mongo fallaba con `querySrv ECONNREFUSED`. No tiene que ver con el código: Windows tiene como único DNS `fe80::1` (IPv6 link-local) y el resolver de Node lo ignora y cae a `127.0.0.1`. `nslookup` resuelve el SRV sin problema. Para la prueba se precargó un script que fija el DNS de Node a `8.8.8.8` (ver "Cómo probarlo"). No afecta a Render.
- El panel de turnos del front deja de funcionar al deployar (ver aviso arriba). Se oculta en el brief 01.
- En Render: agregar `CORS_ORIGINS` si el dominio del front cambia, y confirmar que `firebase.key.json` está cargado como Secret File.

## Cómo probarlo

```bash
npm run build
npm start          # con .env completo y firebase.key.json en la raíz
```

Si Mongo falla con `querySrv ECONNREFUSED` (problema de DNS local, ver arriba):

```bash
echo "import dns from 'node:dns'; dns.setServers(['8.8.8.8','1.1.1.1']);" > /tmp/dns-fix.mjs
node --import file:///tmp/dns-fix.mjs dist/index.js
```

Verificaciones (resultado obtenido en local):

```bash
curl -i localhost:$PORT/api/health                           # 200 {"status":"ok"}
curl -i localhost:$PORT/api/users                            # 404 {"message":"Not found"}
curl -i "localhost:$PORT/api/users/email?email=x@x.com"      # 404
curl -i localhost:$PORT/api/roles                            # 404
curl -i localhost:$PORT/api/clients                          # 404
curl -i localhost:$PORT/api/appointments                     # 404
grep -rn "cron.schedule" Source                              # sin resultados
npm test                                                     # 12 fallos previos, ver Pendientes
```

- En la consola aparece **una sola vez** "Conexión a la base de datos exitosa".
- CORS: con `Origin: https://nicolas-sanetti-front.vercel.app` devuelve `Access-Control-Allow-Origin`; con un origen desconocido no lo devuelve.
