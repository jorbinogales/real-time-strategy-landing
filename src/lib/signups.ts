import { sql } from 'drizzle-orm';
import { rows } from '@db/client';
import { SIGNUP_LIMIT_PER_HOUR, POLICY_VERSION, SITE_URL } from './config';
import { ipHash, unsubscribeToken } from './crypto';

// Normalización + validación (el CHECK de la BD exige lo mismo).
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  return email;
}

export type SignupResult =
  | { ok: true; inserted: boolean; optedIn: boolean }
  | { ok: false; reason: 'rate_limited' };

export async function registerEmail(input: {
  email: string; marketing: boolean; ip: string; campaign?: string | null; source?: 'play_online' | 'download_waitlist';
}): Promise<SignupResult> {
  const hash = ipHash(input.ip);
  const campaign = input.campaign?.trim().slice(0, 100) || null;

  // Un correo ya conocido vuelve a entrar sin gastar cuota: el límite solo frena altas nuevas.
  const known = await rows(sql`SELECT 1 FROM email_signups WHERE email = ${input.email}`);
  if (known.length === 0) {
    const [recent] = await rows<{ n: number }>(sql`SELECT count(*)::int AS n FROM email_signups
      WHERE ip_hash = ${hash} AND created_at > now() - interval '1 hour'`);
    if (Number(recent?.n) >= SIGNUP_LIMIT_PER_HOUR) return { ok: false, reason: 'rate_limited' };
  }

  // Q1 de docs/schema.md.
  const [row] = await rows<{ inserted: boolean; opted_in: boolean }>(sql`
    INSERT INTO email_signups (email, source, campaign, policy_version, marketing_opt_in_at, ip_hash)
    VALUES (${input.email}, ${input.source ?? 'play_online'}, ${campaign}, ${POLICY_VERSION},
            CASE WHEN ${input.marketing}::boolean THEN now() END, ${hash})
    ON CONFLICT (email) DO UPDATE
      SET last_seen_at        = now(),
          marketing_opt_in_at = COALESCE(email_signups.marketing_opt_in_at, EXCLUDED.marketing_opt_in_at)
    RETURNING id, (xmax = 0) AS inserted, marketing_opt_in_at IS NOT NULL AS opted_in`);

  // Retención: la IP hasheada se purga a los 30 días (oportunista, barata).
  await rows(sql`UPDATE email_signups SET ip_hash = NULL
    WHERE ip_hash IS NOT NULL AND created_at < now() - interval '30 days'`);
  return { ok: true, inserted: row.inserted, optedIn: row.opted_in };
}

export async function signupStats() {
  const [r] = await rows<{ total: number; con_opt_in: number; play_online: number }>(sql`SELECT count(*)::int AS total, count(marketing_opt_in_at)::int AS con_opt_in,
    (count(*) FILTER (WHERE source = 'play_online'))::int AS play_online FROM email_signups`);
  return r;
}

export async function unsubscribeNews(email: string) {
  await rows(sql`UPDATE email_signups SET marketing_opt_in_at = NULL WHERE email = ${email}`);
}

export async function deleteEmail(email: string) {
  await rows(sql`DELETE FROM email_signups WHERE email = ${email}`);
}

export const unsubscribeUrl = (email: string) =>
  `${SITE_URL()}/baja?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;

// CSV de correos para el admin. Se neutraliza la inyección de fórmulas (=, +, -, @).
export async function emailsCsv(): Promise<string> {
  const data = await rows(sql`SELECT email, source, campaign, policy_version, marketing_opt_in_at, created_at, last_seen_at
    FROM email_signups ORDER BY created_at DESC, id DESC`);
  const cell = (v: unknown) => {
    let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ['email', 'origen', 'campania', 'politica', 'acepta_noticias_desde', 'alta', 'ultima_visita', 'baja_url'];
  const lines = data.map((x) =>
    [x.email, x.source, x.campaign, x.policy_version, x.marketing_opt_in_at, x.created_at, x.last_seen_at, unsubscribeUrl(String(x.email))]
      .map(cell).join(','));
  return [head.join(','), ...lines].join('\r\n') + '\r\n';
}
