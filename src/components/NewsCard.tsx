import Image from 'next/image';
import Link from 'next/link';
import { kindLabel, type NewsCard as Card } from '@/lib/news';

export const formatDate = (d: Date | null) =>
  d ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' }).format(d) : '';

export default function NewsCard({ post, featured = false }: { post: Card; featured?: boolean }) {
  const href = `/noticias/${post.slug}`;
  return (
    <article className={`news-card${featured ? ' news-card--featured' : ''}`} data-kind={post.kind}>
      <Link href={href} className="news-card__media" tabIndex={-1} aria-hidden="true">
        {post.coverImageUrl ? (
          // Las portadas son rutas o URL libres del admin: no se pueden optimizar con next/image sin dominios fijos.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="news-card__crest">{kindLabel(post.kind)}</span>
        )}
      </Link>
      <div className="news-card__body">
        <p className="news-meta">
          <span className="news-kind">{kindLabel(post.kind)}</span>
          <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time>
          {post.gameVersion && <span className="news-version">v{post.gameVersion}</span>}
        </p>
        <h3 className="news-card__title"><Link href={href}>{post.title}</Link></h3>
        <p className="news-card__excerpt">{post.excerpt}</p>
        <span className="link-gold news-card__more" aria-hidden="true">Leer más</span>
      </div>
    </article>
  );
}

const CRESTS = ['humanos', 'orcos', 'elfos', 'enanos'];

export function NewsEmpty({ page = 1 }: { page?: number }) {
  return (
    <div className="news-empty">
      <ul className="news-empty__crests" aria-hidden="true">
        {CRESTS.map((r) => (
          <li key={r}><Image src={`/images/_fallback/shields/${r}.png`} alt="" width={64} height={64} sizes="64px" /></li>
        ))}
      </ul>
      <h3>{page > 1 ? 'No hay más noticias' : 'El heraldo aún no trae noticias'}</h3>
      <p>
        {page > 1
          ? 'Has llegado al final del archivo. Vuelve a la primera página para ver lo último.'
          : 'Cuando haya actualizaciones, parches o eventos del juego, aparecerán aquí. Vuelve pronto.'}
      </p>
    </div>
  );
}
