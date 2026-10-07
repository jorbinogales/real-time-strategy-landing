import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/posts-admin';
import PostForm from '../../PostForm';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = /^\d+$/.test(id) ? await getPostById(Number(id)) : null;
  if (!post) notFound();
  return (
    <main>
      <h1>Editar post</h1>
      <PostForm
        initial={{
          id: String(post.id), title: post.title, slug: post.slug, excerpt: post.excerpt, body_md: post.bodyMd,
          cover_image_url: post.coverImageUrl ?? '', kind: post.kind, game_version: post.gameVersion ?? '',
          status: post.status, published_at: post.publishedAt ? post.publishedAt.toISOString().slice(0, 16) : '',
          author_name: post.authorName,
        }}
      />
    </main>
  );
}
