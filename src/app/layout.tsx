import type { Metadata, Viewport } from 'next';
import { Lilita_One, MedievalSharp, Nunito } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SiteSounds from '@/components/SiteSounds';
import { GAME_NAME } from '@/data/brand';
import './globals.css';

// Las mismas fuentes que el juego (Lilita One + MedievalSharp) y Nunito para texto largo.
const lilita = Lilita_One({ weight: '400', subsets: ['latin'], variable: '--f-ui', display: 'swap' });
const medieval = MedievalSharp({ weight: '400', subsets: ['latin'], variable: '--f-title', display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], variable: '--f-body', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `${GAME_NAME} · Estrategia en tiempo real`, template: `%s · ${GAME_NAME}` },
  description: 'MasterWar: videojuego de estrategia en tiempo real con cuatro razas (humanos, orcos, elfos y enanos). Juega online desde el navegador.',
};

export const viewport: Viewport = { themeColor: '#150c06', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${lilita.variable} ${medieval.variable} ${nunito.variable}`}>
      <body>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <SiteHeader />
        <div id="contenido">{children}</div>
        <SiteFooter />
        <SiteSounds />
      </body>
    </html>
  );
}
