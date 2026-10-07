'use server';

import { redirect } from 'next/navigation';
import { normalizeEmail, deleteEmail, unsubscribeNews } from '@/lib/signups';
import { verifyUnsubscribeToken } from '@/lib/crypto';

// El token se vuelve a verificar aquí: la página no es una barrera para la acción.
export async function bajaAction(fd: FormData) {
  const email = normalizeEmail(fd.get('e'));
  const token = String(fd.get('t') ?? '');
  if (!email || !verifyUnsubscribeToken(email, token)) redirect('/baja');
  if (fd.get('what') === 'delete') {
    await deleteEmail(email);
    redirect('/baja?done=delete');
  }
  await unsubscribeNews(email);
  redirect('/baja?done=news');
}
