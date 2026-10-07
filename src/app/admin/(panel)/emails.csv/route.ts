import { isAdmin } from '@/lib/admin-auth';
import { emailsCsv } from '@/lib/signups';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return new Response('No autorizado', { status: 401 });
  return new Response(await emailsCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="correos.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
