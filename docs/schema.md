# Esquema de datos — rts-landing

Autor: J.O.R.B.I · 2026-10-07 · Migración: `db/migrations/0001_init.sql`

## 1. Motor y librería

**Postgres en todos los entornos: PGlite en desarrollo y Postgres de Railway en producción. Acceso con Drizzle ORM.**

- PGlite (`@electric-sql/pglite`) es Postgres real compilado a WASM: corre dentro del proceso de Node y guarda los datos en una carpeta (`./.data/pg`). No hace falta instalar nada en Windows.
- Con un solo dialecto hay **un solo** archivo de esquema y **un solo** juego de migraciones. Con SQLite en dev y Postgres en prod, Drizzle obligaría a mantener dos esquemas (`sqliteTable` y `pgTable`) y las diferencias entre ambos no aparecerían hasta producción.
- Drizzle trae un driver para cada lado (`drizzle-orm/pglite` y `drizzle-orm/node-postgres`) y las consultas tipadas son las mismas. Es más ligero que Prisma: no hay binario de motor ni paso de `generate`, y funciona en Edge y en serverless.
- Selector: `DATABASE_URL` vacía → PGlite local; si tiene valor → `pg` contra Railway. Son unas 10 líneas en `db/client.ts`.
- **Verificado:** `0001_init.sql` se aplicó en PGlite 0.5.8 (PostgreSQL 18.3) y pasaron 16 aserciones de invariantes y consultas. El DDL sólo usa funciones de PG ≥ 10, así que sirve tal cual en Railway (16/17/18).

**Migraciones:** el SQL de `db/migrations/` es la fuente de verdad. Un runner mínimo aplica en orden los archivos que todavía no estén en `schema_migrations(name text primary key, applied_at timestamptz default now())`, cada uno dentro de una transacción. `db/schema.ts` (Drizzle) **refleja** ese SQL sólo para tipar las consultas; no se usa `drizzle-kit push`.

## 2. Modelo

### `email_signups` — correos de "JUGAR ONLINE"

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint identity PK | |
| `email` | text NOT NULL UNIQUE | Normalizado por la app (`trim().toLowerCase()`); un CHECK lo exige. Los puntos de Gmail no se tocan. |
| `source` | text NOT NULL | `play_online` \| `download_waitlist` (este último queda listo para el botón de descarga). |
| `campaign` | text NULL | `utm_campaign` u origen libre, ≤100. |
| `policy_version` | text NOT NULL | Versión de la política de privacidad vigente al dar el correo (p. ej. `2026-10`). Sirve como prueba de que se informó al usuario. |
| `marketing_opt_in_at` | timestamptz NULL | NULL = no quiere noticias por correo. Con fecha = consintió en ese momento. |
| `ip_hash` | text NULL | `HMAC-SHA256(ip, IP_HASH_SECRET)` en hex. La IP en claro **nunca** se guarda. Se purga a los 30 días. |
| `created_at` / `last_seen_at` | timestamptz | `last_seen_at` se actualiza cada vez que la persona vuelve a meter su correo. |

**Por qué no hay columna `estado`.** Hay dos estados reales y los dos se derivan: "sigue suscrito a noticias" equivale a `marketing_opt_in_at IS NOT NULL`, y "dado de baja del todo" significa que la fila ya no existe. Una columna `status` aparte podría contradecir a esas dos y no aportaría información. No hay doble opt-in porque el correo da acceso al juego y no es una suscripción. Si en algún momento se envían newsletters masivas, ahí sí conviene añadir `confirmed_at`.

**Consentimiento (GDPR básico).** Para jugar basta con dar el correo, con la política enlazada y su versión guardada. Recibir noticias es una **casilla aparte y desmarcada**, y sólo si se marca se rellena `marketing_opt_in_at`. Si el mismo correo vuelve sin marcar la casilla, el upsert **no** borra el opt-in que ya tenía. Si vuelve marcándola, se registra el consentimiento.

**Bajas:**
- *Baja de noticias:* `UPDATE … SET marketing_opt_in_at = NULL`.
- *Derecho al olvido:* `DELETE FROM email_signups WHERE email = $1`. Ninguna tabla tiene FK hacia esta, así que el borrado no deja restos.
- Ambos enlaces llevan un token **sin estado**: `HMAC-SHA256(email, UNSUBSCRIBE_SECRET)`, que se compara con `timingSafeEqual`. Así nadie puede dar de baja o borrar el correo de otra persona sabiendo sólo la dirección, y no hace falta guardar una columna de token.
- *Retención de `ip_hash`:* un cron diario (o la propia ruta de alta) pone `ip_hash = NULL` en las filas con más de 30 días.

### `news_posts` — noticias y actualizaciones

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint identity PK | |
| `slug` | text NOT NULL UNIQUE | `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤120. Es la URL pública: `/noticias/<slug>`. |
| `title` / `excerpt` | text NOT NULL | Hasta 200 / 300 caracteres. El extracto se usa en la tarjeta y en `og:description`. |
| `body_md` | text NOT NULL | Markdown. Se renderiza **saneado** porque el contenido lo escribe un admin, pero sigue siendo HTML. |
| `cover_image_url` | text NULL | Ruta en `/public` o URL absoluta, ≤500. |
| `kind` | text NOT NULL | `update` \| `patch` \| `event` \| `announcement`. La UI muestra "Actualización / Parche / Evento / Anuncio". |
| `game_version` | text NULL | p. ej. `0.4.2`, ≤32. |
| `status` | text NOT NULL | `draft` \| `published`. |
| `published_at` | timestamptz NULL | **Obligatoria si `status = 'published'`** (CHECK). Si es una fecha futura, el post queda programado y no se ve hasta esa fecha. |
| `author_name` | text NOT NULL | Nombre que se muestra al lector (no hay tabla de usuarios). |
| `created_at` / `updated_at` | timestamptz | La app actualiza `updated_at` en cada UPDATE (Drizzle `$onUpdate`). No hace falta trigger. |

### Índices

- `email_signups_email_uq` (UNIQUE): sostiene el upsert idempotente y la búsqueda para baja y borrado.
- `email_signups_ip_recent_idx (ip_hash, created_at) WHERE ip_hash IS NOT NULL`: para el rate limit por IP.
- `news_posts_slug_uq` (UNIQUE): página de detalle.
- `news_posts_published_idx (published_at DESC, id DESC) WHERE status = 'published'`: listado público. `EXPLAIN` confirma un *Index Scan* sin sort.

Nada más. Los volúmenes son pequeños (miles de correos, decenas o cientos de posts).

### Admin: sin tabla de admins

Para publicar basta con una variable de entorno `ADMIN_PASSWORD`, de 32 o más bytes aleatorios. El flujo es este:

1. `/admin/login` compara la contraseña con `timingSafeEqual`.
2. Si coincide, emite una cookie `httpOnly; Secure; SameSite=Strict` firmada (HMAC con `SESSION_SECRET` y con expiración).
3. Las server actions de crear, editar y publicar verifican esa cookie.
4. El login tiene rate limit para frenar la fuerza bruta.

Una tabla `admins` sólo tendría sentido con varias personas publicando y necesidad de saber quién hizo cada cambio. Mientras no sea así, `author_name` cubre lo que ve el lector.

## 3. DDL

El contenido completo está en `db/migrations/0001_init.sql` (para PGlite y Postgres es el mismo archivo). Resumen de las restricciones:

```sql
-- email_signups
UNIQUE (email)
CHECK (email = lower(btrim(email)))
CHECK (length(email) <= 254 AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
CHECK (source IN ('play_online','download_waitlist'))
CHECK (ip_hash IS NULL OR ip_hash ~ '^[0-9a-f]{64}$')
-- news_posts
UNIQUE (slug)
CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
CHECK (kind IN ('update','patch','event','announcement'))
CHECK (status IN ('draft','published'))
CHECK (status = 'draft' OR published_at IS NOT NULL)
```

### Si algún día hiciera falta SQLite (plan B, no recomendado)

| Postgres | SQLite |
|---|---|
| `bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | `INTEGER PRIMARY KEY` |
| `timestamptz` + `now()` | `TEXT` ISO-8601 UTC + `strftime('%Y-%m-%dT%H:%M:%fZ','now')` |
| `btrim(x)` | `trim(x)` |
| CHECK con `~` (regex) | se elimina y la validación queda sólo en la app (zod) |
| `CASE WHEN $5::boolean THEN now() END` | `CASE WHEN ? THEN strftime(...) END` |
| `RETURNING …, (xmax = 0) AS inserted` | `RETURNING` sí existe, pero `xmax` no; se compara `created_at = last_seen_at` |
| `interval '1 hour'` | `datetime('now','-1 hour')` |

El ON CONFLICT, los índices parciales y los UNIQUE son iguales en los dos.

## 4. Consultas clave

Todas están parametrizadas y se validaron en PGlite.

**Q1 — Alta idempotente de correo** (botón JUGAR ONLINE). La app normaliza el correo antes de llamar.

```sql
INSERT INTO email_signups (email, source, campaign, policy_version, marketing_opt_in_at, ip_hash)
VALUES ($1, $2, $3, $4, CASE WHEN $5::boolean THEN now() END, $6)
ON CONFLICT (email) DO UPDATE
  SET last_seen_at        = now(),
      marketing_opt_in_at = COALESCE(email_signups.marketing_opt_in_at, EXCLUDED.marketing_opt_in_at)
RETURNING id, (xmax = 0) AS inserted, marketing_opt_in_at IS NOT NULL AS opted_in;
```

Se usa `DO UPDATE` y no `DO NOTHING` para que siempre devuelva la fila y no se pierda una ida a la base. Antes de llamar a Q1, el rate limit:

```sql
SELECT count(*) FROM email_signups
WHERE ip_hash = $1 AND created_at > now() - interval '1 hour';   -- p. ej. > 5 → 429
```

**Q2 — Posts publicados, paginados**

```sql
SELECT slug, title, excerpt, cover_image_url, kind, game_version, published_at, author_name
FROM news_posts
WHERE status = 'published' AND published_at <= now()
ORDER BY published_at DESC, id DESC
LIMIT $1 OFFSET $2;          -- página n: LIMIT 9 OFFSET (n-1)*9
```

LIMIT/OFFSET sirve de sobra con cientos de posts y permite enlazar "página 3". Si el listado crece a miles, se cambia a keyset: `AND (published_at, id) < ($cursor_at, $cursor_id)`.

**Q3 — Post por slug**

```sql
SELECT * FROM news_posts
WHERE slug = $1 AND status = 'published' AND published_at <= now();   -- 0 filas → 404
```

La vista previa del admin usa la misma consulta sin los dos filtros de publicación.

**Q4 — Conteo de correos**

```sql
SELECT count(*)                                         AS total,
       count(marketing_opt_in_at)                       AS con_opt_in,
       count(*) FILTER (WHERE source = 'play_online')   AS play_online
FROM email_signups;
```

**Bajas y mantenimiento**

```sql
UPDATE email_signups SET marketing_opt_in_at = NULL WHERE email = $1;          -- baja de noticias
DELETE FROM email_signups WHERE email = $1;                                    -- derecho al olvido
UPDATE email_signups SET ip_hash = NULL
WHERE ip_hash IS NOT NULL AND created_at < now() - interval '30 days';        -- retención
```

## 5. Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Vacía → PGlite en `./.data/pg`. Con valor → Postgres de Railway. |
| `IP_HASH_SECRET` | Clave del HMAC de IP. |
| `UNSUBSCRIBE_SECRET` | Clave del token de baja y borrado. |
| `ADMIN_PASSWORD`, `SESSION_SECRET` | Panel de publicación. |

`./.data/` va en `.gitignore`.
