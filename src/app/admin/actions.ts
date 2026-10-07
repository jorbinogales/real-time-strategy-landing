'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminLogin, adminLogout, requireAdmin } from '@/lib/admin-auth';
import { createPost, deletePost, parsePostForm, setPostStatus, updatePost } from '@/lib/posts-admin';

export type FormState = { error?: string; values?: Record<string, string> };

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const r = await adminLogin(String(fd.get('password') ?? ''));
  if (r === 'ok') redirect('/admin');
  const msg = { bad: 'Contraseña incorrecta.', locked: 'Demasiados intentos. Espera 15 minutos.', disabled: 'El panel está deshabilitado: falta ADMIN_PASSWORD.' }[r];
  return { error: msg };
}

export async function logoutAction() {
  await adminLogout();
  redirect('/admin/login');
}

const echo = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>;

function refresh() {
  revalidatePath('/admin');
  revalidatePath('/noticias');
  revalidatePath('/');
}

// id vacío = crear. Devuelve el error de validación sin perder lo escrito.
export async function savePostAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parsePostForm(fd);
  if (!parsed.ok) return { error: parsed.error, values: echo(fd) };
  const idRaw = String(fd.get('id') ?? '');
  const res = idRaw ? await updatePost(Number(idRaw), parsed.data) : await createPost(parsed.data);
  if (!res.ok) return { error: res.error, values: echo(fd) };
  refresh();
  redirect('/admin');
}

export async function togglePostAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  const to = fd.get('to') === 'published' ? 'published' : 'draft';
  if (Number.isInteger(id)) await setPostStatus(id, to);
  refresh();
}

export async function deletePostAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  if (Number.isInteger(id)) await deletePost(id);
  refresh();
}
