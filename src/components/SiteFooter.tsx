'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { GAME_NAME } from '@/data/brand';

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Logo variant="full" className="site-footer__logo" />
        <nav aria-label="Pie de página">
          <ul>
            <li><Link href="/#inicio">Inicio</Link></li>
            <li><Link href="/#razas">Razas</Link></li>
            <li><Link href="/noticias">Noticias</Link></li>
          </ul>
        </nav>
        <p className="site-footer__legal">© {new Date().getFullYear()} {GAME_NAME}. Juego en desarrollo, lo que ves puede cambiar.</p>
      </div>
    </footer>
  );
}
