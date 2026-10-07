# MasterWar · sitio web

Next.js (App Router) + TypeScript. Base de datos Postgres: PGlite en desarrollo, Postgres real con `DATABASE_URL`.
El juego se llama **MasterWar** (una palabra). Logo: `src/components/Logo.tsx`; SVG sueltos en `public/brand/`; se regeneran con `tools/gen-logo.py` (texto a curvas desde Lilita One).
Contexto del proyecto: `BRIEF.md`. Esquema y consultas: `docs/schema.md`.

## Arrancar

```bash
npm install
cp .env.example .env.local   # opcional en dev; pon ADMIN_PASSWORD para entrar a /admin
npm run dev                  # http://localhost:3000
```

- Sin `DATABASE_URL`, los datos viven en `./.data/pg` (git-ignorado). Las migraciones de `db/migrations/*.sql` se aplican solas al arrancar; también con `npm run db:migrate`.
- `GAME_URL` (por defecto `http://localhost:8000/menu.html`) es a donde entra «JUGAR ONLINE» tras dar el correo.
- En producción (`npm run build && npm start`) `IP_HASH_SECRET`, `UNSUBSCRIBE_SECRET` y `SESSION_SECRET` son obligatorios. `ADMIN_PASSWORD` sin definir deja `/admin` deshabilitado.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Inicio: `#inicio` (JUGAR ONLINE / DESCARGAR), `#razas`, `#noticias` (últimas 3) |
| `POST /api/signup` | Captura de correo (`{email, marketing?, website?}`), cookie firmada `rts_access` |
| `/noticias`, `/noticias/[slug]` | Listado paginado y detalle (solo publicados con fecha ≤ ahora) |
| `/baja?e=…&t=…` | Baja de noticias / borrado del correo (token firmado, pide confirmación) |
| `/admin` | Posts (crear, editar, publicar, despublicar, borrar), conteo de correos y CSV (`/admin/emails.csv`) |

Datos de razas: `src/data/races.ts`. Si falta una imagen definitiva en `public/images/{shields,races,units,buildings}`, la UI usa `public/images/_fallback/`.

## Prueba de extremo a extremo

Con el servidor en marcha: `BASE_URL=http://localhost:3000 npm run test:flow` (alta, repetido, inválido, honeypot, rate limit, CRUD de posts, markdown saneado, bajas).
