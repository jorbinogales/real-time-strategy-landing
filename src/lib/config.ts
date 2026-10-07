export const POLICY_VERSION = '2026-10';
export const GAME_URL = () => process.env.GAME_URL?.trim() || 'http://localhost:8000/menu.html';
export const SITE_URL = () => (process.env.SITE_URL?.trim() || 'http://localhost:3000').replace(/\/$/, '');
export const SIGNUP_LIMIT_PER_HOUR = 5;
export const NEWS_PAGE_SIZE = 9;

export const POST_KINDS = ['update', 'patch', 'event', 'announcement'] as const;
export type PostKind = (typeof POST_KINDS)[number];
export const KIND_LABEL: Record<PostKind, string> = {
  update: 'Actualización',
  patch: 'Parche',
  event: 'Evento',
  announcement: 'Anuncio',
};
