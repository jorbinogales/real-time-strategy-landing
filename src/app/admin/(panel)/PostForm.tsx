'use client';

import { useActionState } from 'react';
import { savePostAction, type FormState } from '../actions';

export type PostFormValues = {
  id?: string; title: string; slug: string; excerpt: string; body_md: string; cover_image_url: string;
  kind: string; game_version: string; status: string; published_at: string; author_name: string;
};

const KINDS: [string, string][] = [['update', 'Actualización'], ['patch', 'Parche'], ['event', 'Evento'], ['announcement', 'Anuncio']];

export default function PostForm({ initial }: { initial: PostFormValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePostAction, {});
  const v = { ...initial, ...state.values };
  // La clave fuerza a React a releer los valores devueltos tras un error (React 19 resetea el formulario).
  return (
    <form action={action} key={state.error ?? 'ok'}>
      <input type="hidden" name="id" defaultValue={v.id ?? ''} />
      <label>Título <input name="title" defaultValue={v.title} required maxLength={200} /></label>
      <label>Slug (vacío = desde el título) <input name="slug" defaultValue={v.slug} maxLength={120} /></label>
      <label>Extracto <textarea name="excerpt" defaultValue={v.excerpt} required maxLength={300} rows={2} /></label>
      <label>Contenido (Markdown) <textarea name="body_md" defaultValue={v.body_md} required rows={14} /></label>
      <label>Imagen de portada (ruta o URL) <input name="cover_image_url" defaultValue={v.cover_image_url} maxLength={500} /></label>
      <label>Tipo
        <select name="kind" defaultValue={v.kind}>
          {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </label>
      <label>Versión del juego <input name="game_version" defaultValue={v.game_version} maxLength={32} /></label>
      <label>Autor <input name="author_name" defaultValue={v.author_name} required maxLength={80} /></label>
      <label>Estado
        <select name="status" defaultValue={v.status}>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
      </label>
      <label>Fecha de publicación (UTC; vacío = ahora; futura = programado)
        <input type="datetime-local" name="published_at" defaultValue={v.published_at} />
      </label>
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</button>
    </form>
  );
}
