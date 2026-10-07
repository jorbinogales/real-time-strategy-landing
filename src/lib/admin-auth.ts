import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { safeEqual, signExpiring, verifyExpiring } from './crypto';
import { clientIp } from './ip';

export const ADMIN_COOKIE = 'rts_admin';
const TTL = 60 * 60 * 8;
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// ponytail: contador en memoria por proceso; con varias instancias el límite se multiplica. Pasar a la BD si hace falta.
const fails = new Map<string, { n: number; since: number }>();

export async function isAdmin(): Promise<boolean> {
  return verifyExpiring('admin', (await cookies()).get(ADMIN_COOKIE)?.value);
}

// Todas las server actions y rutas del panel deben llamarla: un layout no protege las acciones.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}

export async function adminLogin(password: string): Promise<'ok' | 'bad' | 'locked' | 'disabled'> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return 'disabled';
  const ip = clientIp(await headers());
  const now = Date.now();
  const f = fails.get(ip);
  if (f && now - f.since < WINDOW_MS && f.n >= MAX_FAILS) return 'locked';
  if (!safeEqual(password, expected)) {
    fails.set(ip, f && now - f.since < WINDOW_MS ? { n: f.n + 1, since: f.since } : { n: 1, since: now });
    return 'bad';
  }
  fails.delete(ip);
  (await cookies()).set(ADMIN_COOKIE, signExpiring('admin', TTL), {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/admin', maxAge: TTL,
  });
  return 'ok';
}

export async function adminLogout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: '/admin' });
}
