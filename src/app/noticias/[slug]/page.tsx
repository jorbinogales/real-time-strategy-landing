import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from '@/components/NewsCard';
import { renderMarkdown } from '@/lib/markdown';
import { getPublishedBySlug, kindLabel } from '@/lib/news';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedBySlug((await params).slug);
  if (!post) return { title: 'Noticia no encontrada' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article', images: post.coverImageUrl ? [post.coverImageUrl] : undefined },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const post = await getPublishedBySlug((await params).slug);
  if (!post) notFound();
  // Markdown saneado (html:false) -> HTML seguro.
  const html = renderMarkdown(post.bodyMd);

  return (
    <main className="page">
      <div className="wrap wrap--narrow">
        <p><Link href="/noticias" className="back-link">Todas las noticias</Link></p>
        <article className="news-post" data-kind={post.kind}>
          <header className="news-post__head">
            <p className="news-meta">
              <span className="news-kind">{kindLabel(post.kind)}</span>
              <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time>
              {post.gameVersion && <span className="news-version">v{post.gameVersion}</span>}
              <span>{post.authorName}</span>
            </p>
            <h1 className="page-title page-title--post">{post.title}</h1>
            <p className="news-post__lead">{post.excerpt}</p>
            {post.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImageUrl} alt="" className="news-post__cover" decoding="async" />
            )}
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </main>
  );
}
