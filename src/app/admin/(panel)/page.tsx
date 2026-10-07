import Link from 'next/link';
import { kindLabel } from '@/lib/news';
import { listAllPosts } from '@/lib/posts-admin';
import { signupStats } from '@/lib/signups';
import { deletePostAction, togglePostAction } from '../actions';

const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '—');

export default async function AdminHome() {
  const [posts, stats] = await Promise.all([listAllPosts(), signupStats()]);
  return (
    <main>
      <h1>Posts de noticias</h1>

      <section aria-labelledby="correos">
        <h2 id="correos">Correos</h2>
        <p>
          {stats.total} en total · {stats.con_opt_in} aceptan noticias · {stats.play_online} desde «Jugar online».{' '}
          <a href="/admin/emails.csv" download>Exportar CSV</a>
        </p>
      </section>

      <section aria-labelledby="posts">
        <h2 id="posts">Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p>Aún no hay posts. <Link href="/admin/posts/new">Crea el primero</Link>.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Título</th><th>Tipo</th><th>Estado</th><th>Publicación</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {posts.map((p) => {
                  const scheduled = p.status === 'published' && p.publishedAt && p.publishedAt > new Date();
                  return (
                    <tr key={p.id}>
                      <td>{p.title}<br /><small>/noticias/{p.slug}</small></td>
                      <td>{kindLabel(p.kind)}</td>
                      <td>{p.status === 'published' ? (scheduled ? 'Programado' : 'Publicado') : 'Borrador'}</td>
                      <td>{fmt(p.publishedAt)}</td>
                      <td>
                        <Link href={`/admin/posts/${p.id}`}>Editar</Link>{' '}
                        <form action={togglePostAction} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="to" value={p.status === 'published' ? 'draft' : 'published'} />
                          <button type="submit">{p.status === 'published' ? 'Despublicar' : 'Publicar'}</button>
                        </form>{' '}
                        <details style={{ display: 'inline' }}>
                          <summary>Borrar</summary>
                          <form action={deletePostAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit">Confirmar borrado</button>
                          </form>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
