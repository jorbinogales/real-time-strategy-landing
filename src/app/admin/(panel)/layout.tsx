import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { logoutAction } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin">
      <header>
        <nav aria-label="Administración">
          <Link href="/admin">Posts</Link>{' '}
          <Link href="/admin/posts/new">Nuevo post</Link>{' '}
          <Link href="/">Ver sitio</Link>
        </nav>
        <form action={logoutAction}><button type="submit">Salir</button></form>
      </header>
      {children}
    </div>
  );
}
