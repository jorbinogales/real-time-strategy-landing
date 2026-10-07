import { cookies } from 'next/headers';
import { signExpiring, verifyExpiring } from './crypto';

export const ACCESS_COOKIE = 'rts_access';
const YEAR = 60 * 60 * 24 * 365;

export async function hasAccess(): Promise<boolean> {
  return verifyExpiring('access', (await cookies()).get(ACCESS_COOKIE)?.value);
}

export const accessCookie = () => ({
  name: ACCESS_COOKIE,
  value: signExpiring('access', YEAR),
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: YEAR,
});
