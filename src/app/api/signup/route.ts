import { NextResponse } from 'next/server';
import { accessCookie } from '@/lib/access';
import { GAME_URL } from '@/lib/config';
import { clientIp } from '@/lib/ip';
import { normalizeEmail, registerEmail } from '@/lib/signups';

// POST /api/signup  { email, marketing?, website? (honeypot), campaign? }
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body', message: 'Solicitud no válida.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_body', message: 'Solicitud no válida.' }, { status: 400 });
  }

  // Honeypot: los humanos no ven este campo. Respondemos como si hubiera ido bien, sin guardar ni dar cookie.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true, gameUrl: GAME_URL() });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ ok: false, error: 'invalid_email', message: 'Introduce un correo válido.' }, { status: 400 });
  }

  const result = await registerEmail({
    email,
    marketing: body.marketing === true,
    ip: clientIp(req.headers),
    campaign: typeof body.campaign === 'string' ? body.campaign : null,
  });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', message: 'Demasiados intentos desde tu conexión. Inténtalo más tarde.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    );
  }

  const res = NextResponse.json({ ok: true, gameUrl: GAME_URL() });
  res.cookies.set(accessCookie());
  return res;
}
