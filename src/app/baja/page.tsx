import type { Metadata } from 'next';
import Link from 'next/link';
import { verifyUnsubscribeToken } from '@/lib/crypto';
import { normalizeEmail } from '@/lib/signups';
import { bajaAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Baja de noticias', robots: { index: false } };

// El enlace del correo solo muestra la confirmación: abrirlo (o un escáner que lo precarga) no da de baja a nadie.
export default async function BajaPage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string; done?: string }> }) {
  const { e, t, done } = await searchParams;

  if (done === 'news' || done === 'delete') {
    return (
      <main className="page simple"><div className="wrap wrap--narrow"><div className="panel">
        <h1 className="page-title page-title--sm">{done === 'news' ? 'Listo: no recibirás más noticias' : 'Listo: hemos borrado tu correo'}</h1>
        <p><Link href="/" className="link-gold">Volver al inicio</Link></p>
      </div></div></main>
    );
  }

  const email = normalizeEmail(e);
  if (!email || !t || !verifyUnsubscribeToken(email, t)) {
    return (
      <main className="page simple"><div className="wrap wrap--narrow"><div className="panel">
        <h1 className="page-title page-title--sm">Enlace no válido</h1>
        <p>El enlace de baja es incorrecto o está incompleto. Usa el enlace del último correo que recibiste.</p>
        <p><Link href="/" className="link-gold">Volver al inicio</Link></p>
      </div></div></main>
    );
  }

  return (
    <main className="page simple"><div className="wrap wrap--narrow"><div className="panel">
      <h1 className="page-title page-title--sm">Baja de noticias</h1>
      <p>Correo: <strong>{email}</strong></p>
      <form action={bajaAction} className="stack">
        <input type="hidden" name="e" value={email} />
        <input type="hidden" name="t" value={t} />
        <button type="submit" name="what" value="news" className="btn-stone">Dejar de recibir noticias</button>
        <button type="submit" name="what" value="delete" className="btn-stone btn-stone--danger">Borrar mi correo por completo</button>
      </form>
    </div></div></main>
  );
}
