// ponytail: se confía en las cabeceras del proxy (Railway pone x-real-ip / x-forwarded-for). Fuera de un proxy de confianza son falsificables.
export function clientIp(h: Headers): string {
  return h.get('x-real-ip')?.trim() || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
