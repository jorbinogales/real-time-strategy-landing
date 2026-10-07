'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { GAME_NAME } from '@/data/brand';

const LINKS = [
  { href: '/#inicio', label: 'Inicio' },
  { href: '/#razas', label: 'Razas' },
  { href: '/noticias', label: 'Noticias' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/#inicio" className="brand" aria-label={`${GAME_NAME}, ir al inicio`}>
          <Logo variant="full" decorative className="brand__full" />
          <Logo variant="emblem" decorative className="brand__mark" />
        </Link>
        <nav aria-label="Principal">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={pathname.startsWith('/noticias') && l.href === '/noticias' ? 'page' : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
