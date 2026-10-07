import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

type SecretName = 'IP_HASH_SECRET' | 'UNSUBSCRIBE_SECRET' | 'SESSION_SECRET';

// En producción los secretos son obligatorios; en desarrollo hay un valor fijo e inseguro.
export function secret(name: SecretName): string {
  const v = process.env[name]?.trim();
  if (v) return v;
  if (process.env.NODE_ENV === 'production') throw new Error(`Falta la variable de entorno ${name}`);
  return `dev-insecure-${name}`;
}

export const hmacHex = (message: string, key: string) => createHmac('sha256', key).update(message).digest('hex');

export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

// Token firmado con caducidad: "<exp>.<firma>". `scope` separa los usos (acceso, admin).
export function signExpiring(scope: string, ttlSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${exp}.${hmacHex(`${scope}:${exp}`, secret('SESSION_SECRET'))}`;
}

export function verifyExpiring(scope: string, token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, hmacHex(`${scope}:${exp}`, secret('SESSION_SECRET')));
}

export const ipHash = (ip: string) => hmacHex(ip, secret('IP_HASH_SECRET'));

export const unsubscribeToken = (email: string) => hmacHex(`unsub:${email}`, secret('UNSUBSCRIBE_SECRET'));
export const verifyUnsubscribeToken = (email: string, token: string) => safeEqual(token, unsubscribeToken(email));
