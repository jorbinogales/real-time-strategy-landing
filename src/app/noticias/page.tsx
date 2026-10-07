import type { Metadata } from 'next';
import Link from 'next/link';
import NewsCard, { NewsEmpty } from '@/components/NewsCard';
import { listPublished } from '@/lib/news';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Noticias', description: 'Actualizaciones, parches y eventos del juego.' };

export default async function NewsIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: raw } = await searchParams;
  const page = /^\d{1,6}$/.test(raw ?? '') ? Math.max(1, Number(raw)) : 1;
  const { items, pages } = await listPublished(page);

  return (
    <main className="page">
      <div className="wrap">
        <header className="page-head">
          <h1 className="page-title">Noticias</h1>
          <p className="section__lead">Actualizaciones, parches y eventos del juego.</p>
        </header>
        {items.length === 0 ? (
          <NewsEmpty page={page} />
        ) : (
          <div className="news-grid news-grid--list">
            {items.map((p) => <NewsCard key={p.slug} post={p} />)}
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Paginación" className="pager">
            {page > 1 ? <Link href={`/noticias?page=${page - 1}`} rel="prev" className="btn-stone btn-stone--sm">Anteriores</Link> : <span />}
            <span className="pager__now">Página {page} de {pages}</span>
            {page < pages ? <Link href={`/noticias?page=${page + 1}`} rel="next" className="btn-stone btn-stone--sm">Siguientes</Link> : <span />}
          </nav>
        )}
        {items.length === 0 && page > 1 && (
          <p className="pager"><Link href="/noticias" className="btn-stone btn-stone--sm">Volver a la primera página</Link></p>
        )}
      </div>
    </main>
  );
}
