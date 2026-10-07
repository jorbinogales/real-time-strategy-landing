import PostForm from '../../PostForm';

export default function NewPostPage() {
  return (
    <main>
      <h1>Nuevo post</h1>
      <PostForm initial={{ title: '', slug: '', excerpt: '', body_md: '', cover_image_url: '', kind: 'update', game_version: '', status: 'draft', published_at: '', author_name: 'Equipo RTS' }} />
    </main>
  );
}
