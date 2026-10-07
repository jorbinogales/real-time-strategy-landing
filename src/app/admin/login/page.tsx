import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · Acceso', robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main className="admin-login">
      <h1>Panel de administración</h1>
      <LoginForm />
    </main>
  );
}
