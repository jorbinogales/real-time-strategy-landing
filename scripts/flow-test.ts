// Prueba de humo de extremo a extremo contra un servidor ya levantado:
//   npm run dev  (otra terminal)   y luego   BASE_URL=http://localhost:3000 npm run test:flow
// Requiere ADMIN_PASSWORD en el servidor (por defecto usa la de .env.local: dev-admin-password).
// Usa los secretos de desarrollo por defecto (no definir *_SECRET ni NODE_ENV=production en el servidor).
import { unsubscribeToken } from '../src/lib/crypto';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const PASS = process.env.ADMIN_PASSWORD ?? 'dev-admin-password';
const RUN = Date.now().toString(36);

let failures = 0;
const check = (name: string, ok: boolean, extra = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !extra ? '' : `  -> ${extra}`}`);
};

class Jar {
  private c = new Map<string, string>();
  absorb(res: Response) {
    for (const line of res.headers.getSetCookie()) {
      const [pair, ...attrs] = line.split(';');
      const [k, ...v] = pair.split('=');
      const val = v.join('=');
      if (attrs.some((a) => /max-age=0/i.test(a)) || val === '') this.c.delete(k.trim());
      else this.c.set(k.trim(), val);
    }
  }
  header() { return [...this.c].map(([k, v]) => `${k}=${v}`).join('; '); }
  has(k: string) { return this.c.has(k); }
}

async function req(path: string, jar: Jar, init: RequestInit & { ip?: string } = {}) {
  const headers = new Headers(init.headers);
  if (jar.header()) headers.set('cookie', jar.header());
  if (init.ip) headers.set('x-real-ip', init.ip);
  const res = await fetch(BASE + path, { ...init, headers, redirect: 'manual' });
  jar.absorb(res);
  return res;
}

const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// Envía un formulario (server action sin JS): hidden inputs del HTML + campos dados.
async function submitForm(path: string, jar: Jar, pick: (formHtml: string) => boolean, fields: Record<string, string>) {
  const html = await (await req(path, jar)).text();
  const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/g)].map((m) => m[0]);
  const form = forms.find(pick);
  if (!form) throw new Error(`No se encontró el formulario en ${path}`);
  const fd = new FormData();
  for (const m of form.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?/g)) fd.append(decode(m[1]), decode(m[2] ?? ''));
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  const res = await req(path, jar, { method: 'POST', body: fd });
  return { res, body: res.status === 200 ? await res.text() : '' };
}

const signup = (jar: Jar, body: object, ip: string) =>
  req('/api/signup', jar, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), ip });

async function main() {
  const visitor = new Jar();
  const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.1`;

  // --- Captura de correo ---
  const email = `Jugador-${RUN}@Example.com`;
  let r = await signup(visitor, { email: `  ${email}  `, marketing: false }, ip);
  let j = await r.json();
  check('alta: 200 + gameUrl', r.status === 200 && j.ok && typeof j.gameUrl === 'string', JSON.stringify(j));
  check('alta: cookie rts_access', visitor.has('rts_access'));
  r = await signup(visitor, { email: email.toLowerCase(), marketing: false }, ip);
  check('repetido (otra capitalización): 200 idempotente', r.status === 200 && (await r.json()).ok);
  r = await signup(new Jar(), { email: 'esto-no-es-un-correo' }, ip);
  check('inválido: 400', r.status === 400);
  r = await signup(new Jar(), { email: `bot-${RUN}@example.com`, website: 'http://spam' }, ip);
  const botJar = new Jar();
  check('honeypot: respuesta neutra, sin guardar', r.status === 200 && !botJar.has('rts_access'));
  const home = await (await req('/', visitor)).text();
  check('home con cookie: JUGAR ONLINE es enlace directo', /<a class="btn btn-play" href="http:\/\/localhost:8000\/menu\.html">JUGAR ONLINE/.test(home));
  const homeAnon = await (await req('/', new Jar())).text();
  check('home sin cookie: JUGAR ONLINE abre formulario', /<button type="button" class="btn btn-play">JUGAR ONLINE/.test(homeAnon) && homeAnon.includes('DESCARGAR PARA WINDOWS') && homeAnon.includes('Próximamente'));
  check('home: secciones #inicio #razas #noticias', ['id="inicio"', 'id="razas"', 'id="noticias"'].every((s) => homeAnon.includes(s)));

  // Rate limit: 5 altas nuevas por IP/hora; la 6ª nueva da 429, pero un correo ya conocido sigue entrando.
  const ip2 = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.2`;
  const codes: number[] = [];
  for (let i = 0; i < 6; i++) codes.push((await signup(new Jar(), { email: `rl-${RUN}-${i}@example.com` }, ip2)).status);
  check('rate limit: 5x200 y la 6ª 429', codes.slice(0, 5).every((c) => c === 200) && codes[5] === 429, codes.join(','));
  check('rate limit: correo ya conocido no se bloquea', (await signup(new Jar(), { email: `rl-${RUN}-0@example.com` }, ip2)).status === 200);

  // --- Admin ---
  const admin = new Jar();
  check('admin sin sesión: redirige a login', (await req('/admin', admin)).status === 307);
  check('csv sin sesión: 401', (await req('/admin/emails.csv', admin)).status === 401);
  let sub = await submitForm('/admin/login', admin, () => true, { password: 'incorrecta' });
  check('login con contraseña mala: error y sin cookie', sub.body.includes('Contraseña incorrecta') && !admin.has('rts_admin'));
  sub = await submitForm('/admin/login', admin, () => true, { password: PASS });
  check('login correcto: 303 + cookie de sesión', sub.res.status === 303 && admin.has('rts_admin'));

  const csv = await (await req('/admin/emails.csv', admin)).text();
  const mine = csv.split('\r\n').find((l) => l.startsWith(email.toLowerCase() + ','));
  check('csv: contiene el correo normalizado, una sola vez', !!mine && csv.split('\r\n').filter((l) => l.startsWith(email.toLowerCase() + ',')).length === 1, mine);
  check('csv: no contiene el del honeypot', !csv.includes(`bot-${RUN}@`));

  // --- CRUD de posts ---
  const idOf = async (slug: string) => {
    const html = (await (await req('/admin', admin)).text()).replace(/<!-- -->/g, '');
    const row = [...html.matchAll(/<tr>[\s\S]*?<\/tr>/g)].map((m) => m[0]).find((t) => t.includes(`/noticias/${slug}<`));
    return row?.match(/\/admin\/posts\/(\d+)/)?.[1];
  };
  const base = { title: `Parche ${RUN}`, slug: `parche-${RUN}`, excerpt: 'Resumen del parche', body_md: '# Hola\n\nTexto **fuerte**\n\n<script>alert(1)</script>\n\n[mala](javascript:alert(1)) [buena](https://example.com)', cover_image_url: '', kind: 'patch', game_version: '0.4.2', author_name: 'Equipo', status: 'published', published_at: '', id: '' };
  const slug = base.slug;
  sub = await submitForm('/admin/posts/new', admin, (f) => f.includes('name="title"'), base);
  check('crear post publicado: 303 a /admin', sub.res.status === 303, `${sub.res.status} ${sub.body.slice(0, 80)}`);
  const id = await idOf(slug);
  check('post aparece en el listado de admin', !!id);

  const list = await (await req('/noticias', new Jar())).text();
  check('/noticias lista el post publicado', list.includes(base.title) && list.includes('Parche'));
  const detail = await req(`/noticias/${slug}`, new Jar());
  const dhtml = await detail.text();
  check('/noticias/[slug]: 200 con markdown renderizado', detail.status === 200 && dhtml.includes('<strong>fuerte</strong>') && dhtml.includes('<h1>Hola</h1>'));
  check('markdown saneado: sin <script> ni javascript:', !dhtml.includes('<script>alert(1)') && !/href="javascript:/i.test(dhtml) && dhtml.includes('href="https://example.com"'));
  check('home muestra el post en #noticias', (await (await req('/', new Jar())).text()).includes(base.title));

  sub = await submitForm('/admin/posts/new', admin, (f) => f.includes('name="title"'), { ...base, title: 'Otro' });
  check('slug duplicado: error, no se crea', sub.body.includes('Ya existe un post con ese slug'), String(sub.res.status));

  // borrador y programado no son públicos
  const draftSlug = `borrador-${RUN}`, futureSlug = `futuro-${RUN}`;
  await submitForm('/admin/posts/new', admin, (f) => f.includes('name="title"'), { ...base, title: 'Borrador', slug: draftSlug, status: 'draft' });
  const future = new Date(Date.now() + 86400_000 * 2).toISOString().slice(0, 16);
  await submitForm('/admin/posts/new', admin, (f) => f.includes('name="title"'), { ...base, title: 'Futuro', slug: futureSlug, status: 'published', published_at: future });
  check('borrador: 404 público', (await req(`/noticias/${draftSlug}`, new Jar())).status === 404);
  check('programado (fecha futura): 404 público', (await req(`/noticias/${futureSlug}`, new Jar())).status === 404);
  check('borrador/programado fuera del listado', !(await (await req('/noticias', new Jar())).text()).includes('Borrador'));

  // editar
  sub = await submitForm(`/admin/posts/${id}`, admin, (f) => f.includes('name="title"'), { ...base, id: id ?? '', title: `Parche ${RUN} editado` });
  check('editar post: 303', sub.res.status === 303, String(sub.res.status));
  check('edición visible en público', (await (await req(`/noticias/${slug}`, new Jar())).text()).includes('editado'));

  // despublicar / publicar
  const toggle = (to: string) => submitForm('/admin', admin, (f) => f.includes(`name="id" value="${id}"`) && f.includes(`value="${to}"`), {});
  await toggle('draft');
  check('despublicar: 404 público', (await req(`/noticias/${slug}`, new Jar())).status === 404);
  await toggle('published');
  check('publicar de nuevo: 200 público', (await req(`/noticias/${slug}`, new Jar())).status === 200);

  // borrar los tres
  for (const s of [slug, draftSlug, futureSlug]) {
    const pid = await idOf(s);
    if (pid) await submitForm('/admin', admin, (f) => f.includes(`name="id" value="${pid}"`) && !f.includes('name="to"'), {});
  }
  check('borrar: post eliminado', (await req(`/noticias/${slug}`, new Jar())).status === 404 && !(await idOf(slug)));

  const csvAfter = await (await req('/admin/emails.csv', admin)).text();
  const bajaUrl = csvAfter.split('\r\n').find((l) => l.startsWith(email.toLowerCase() + ','))?.split(',').pop() ?? '';
  const bajaPath = bajaUrl.replace(/^https?:\/\/[^/]+/, '');

  // --- Baja ---
  // Opt-in -> baja de noticias
  await signup(new Jar(), { email: email.toLowerCase(), marketing: true }, ip);
  const optIn = (await (await req('/admin/emails.csv', admin)).text()).split('\r\n').find((l) => l.startsWith(email.toLowerCase() + ','))!;
  check('reentrada con casilla marcada registra el opt-in', optIn.split(',')[4] !== '');
  const bad = await (await req(`/baja?e=${encodeURIComponent(email.toLowerCase())}&t=${'0'.repeat(64)}`, new Jar())).text();
  check('/baja con token falso: enlace no válido', bad.includes('Enlace no válido'));
  check('token de baja coincide con el del CSV', bajaPath.includes(unsubscribeToken(email.toLowerCase())));
  const page = await (await req(bajaPath, new Jar())).text();
  check('/baja con token válido: pide confirmación (GET no da de baja)', page.includes('Dejar de recibir noticias'));
  const still = (await (await req('/admin/emails.csv', admin)).text()).split('\r\n').find((l) => l.startsWith(email.toLowerCase() + ','))!;
  check('GET /baja no cambió nada', still.split(',')[4] !== '');
  await submitForm(bajaPath, new Jar(), (f) => f.includes('name="e"'), { what: 'news' });
  const off = (await (await req('/admin/emails.csv', admin)).text()).split('\r\n').find((l) => l.startsWith(email.toLowerCase() + ','))!;
  check('baja de noticias: opt-in a NULL, correo sigue', !!off && off.split(',')[4] === '');
  await submitForm(bajaPath, new Jar(), (f) => f.includes('name="e"'), { what: 'delete' });
  check('borrado del correo: fila eliminada', !(await (await req('/admin/emails.csv', admin)).text()).includes(email.toLowerCase() + ','));

  console.log(failures ? `\n${failures} comprobación(es) fallida(s)` : '\nTodo correcto');
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
