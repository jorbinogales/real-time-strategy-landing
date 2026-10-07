-- 0001_init.sql — esquema inicial de rts-landing
-- Dialecto: PostgreSQL 16+. Corre igual en PGlite (desarrollo, sin servidor)
-- y en Postgres de Railway (producción). Ver docs/schema.md.

-- ---------------------------------------------------------------------------
-- Correos de quienes piden jugar online (o, más adelante, la descarga).
-- Una fila por correo. Baja de marketing = marketing_opt_in_at a NULL.
-- Derecho al olvido = DELETE de la fila (no hay FKs que la retengan).
-- ---------------------------------------------------------------------------
CREATE TABLE email_signups (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Normalizado por la app (trim + minúsculas); la BD lo exige.
  email               text        NOT NULL,
  -- Qué botón lo trajo.
  source              text        NOT NULL DEFAULT 'play_online',
  -- utm_campaign u origen libre, opcional.
  campaign            text,
  -- Versión de la política de privacidad aceptada al dar el correo.
  policy_version      text        NOT NULL,
  -- NULL = no aceptó recibir noticias por correo. Fecha = cuándo aceptó.
  marketing_opt_in_at timestamptz,
  -- HMAC-SHA256(ip, IP_HASH_SECRET) en hex; sólo antiabuso, se purga a 30 días.
  ip_hash             text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  -- Última vez que volvió a introducir el correo (upsert).
  last_seen_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT email_signups_email_uq         UNIQUE (email),
  CONSTRAINT email_signups_email_normalized CHECK (email = lower(btrim(email))),
  CONSTRAINT email_signups_email_format     CHECK (length(email) <= 254
                                                   AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT email_signups_source_chk       CHECK (source IN ('play_online', 'download_waitlist')),
  CONSTRAINT email_signups_campaign_len     CHECK (campaign IS NULL OR length(campaign) BETWEEN 1 AND 100),
  CONSTRAINT email_signups_policy_len       CHECK (length(policy_version) BETWEEN 1 AND 32),
  CONSTRAINT email_signups_ip_hash_fmt      CHECK (ip_hash IS NULL OR ip_hash ~ '^[0-9a-f]{64}$')
);

-- Rate limit por IP: "cuántos correos distintos desde esta IP en la última hora".
CREATE INDEX email_signups_ip_recent_idx
  ON email_signups (ip_hash, created_at)
  WHERE ip_hash IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Posts de noticias / actualizaciones del juego.
-- ---------------------------------------------------------------------------
CREATE TABLE news_posts (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug             text        NOT NULL,
  title            text        NOT NULL,
  excerpt          text        NOT NULL,
  body_md          text        NOT NULL,
  -- Ruta en /public o URL absoluta de la portada.
  cover_image_url  text,
  kind             text        NOT NULL DEFAULT 'update',
  -- Versión del juego a la que se refiere (p. ej. '0.4.2'), opcional.
  game_version     text,
  status           text        NOT NULL DEFAULT 'draft',
  -- Obligatoria al publicar; si es futura, el post queda programado.
  published_at     timestamptz,
  author_name      text        NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT news_posts_slug_uq        UNIQUE (slug),
  CONSTRAINT news_posts_slug_fmt       CHECK (length(slug) <= 120 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT news_posts_title_len      CHECK (length(btrim(title)) BETWEEN 1 AND 200),
  CONSTRAINT news_posts_excerpt_len    CHECK (length(btrim(excerpt)) BETWEEN 1 AND 300),
  CONSTRAINT news_posts_body_len       CHECK (length(btrim(body_md)) >= 1),
  CONSTRAINT news_posts_cover_len      CHECK (cover_image_url IS NULL OR length(cover_image_url) BETWEEN 1 AND 500),
  CONSTRAINT news_posts_kind_chk       CHECK (kind IN ('update', 'patch', 'event', 'announcement')),
  CONSTRAINT news_posts_version_len    CHECK (game_version IS NULL OR length(game_version) BETWEEN 1 AND 32),
  CONSTRAINT news_posts_status_chk     CHECK (status IN ('draft', 'published')),
  CONSTRAINT news_posts_published_at   CHECK (status = 'draft' OR published_at IS NOT NULL),
  CONSTRAINT news_posts_author_len     CHECK (length(btrim(author_name)) BETWEEN 1 AND 80)
);

-- Listado público: publicados, más recientes primero. Parcial: los borradores no ocupan.
CREATE INDEX news_posts_published_idx
  ON news_posts (published_at DESC, id DESC)
  WHERE status = 'published';
