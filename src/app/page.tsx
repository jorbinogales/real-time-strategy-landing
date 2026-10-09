import Image from 'next/image';
import Link from 'next/link';
import NewsCard, { NewsEmpty } from '@/components/NewsCard';
import PlayOnline from '@/components/PlayOnline';
import RaceExplorer from '@/components/RaceExplorer';
import { hasAccess } from '@/lib/access';
import { GAME_URL } from '@/lib/config';
import { latestPublished, type NewsCard as Card } from '@/lib/news';
import Logo from '@/components/Logo';
import { TAGLINE } from '@/data/brand';
import { heroSrc, resolveRaces } from '@/data/site';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [access, news] = await Promise.all([
    hasAccess(),
    latestPublished(3).catch((e): Card[] => { console.error('No se pudieron leer las noticias', e); return []; }),
  ]);
  const races = resolveRaces();

  return (
    <main>
      <section id="inicio" className="hero" aria-labelledby="titulo-inicio">
        <div className="hero__bg" aria-hidden="true">
          <Image src={heroSrc()} alt="" fill preload sizes="100vw" className="hero__img" />
        </div>
        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__content">
          <h1 id="titulo-inicio" className="game-title">
            <Logo variant="full" className="game-title__logo" />
          </h1>
          <p className="hero__tagline">{TAGLINE}</p>
          <div className="cta">
            <PlayOnline hasAccess={access} gameUrl={GAME_URL()} />
            <a className="btn-hero btn-download" href="/descargar/windows" download="MasterWar-Setup.exe" aria-describedby="descarga-nota">
              <svg className="btn-hero__ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16" /></svg>
              <span className="btn-hero__label">DESCARGAR PARA WINDOWS</span>
              <span id="descarga-nota" className="btn-hero__soon">Windows 10/11</span>
            </a>
          </div>
        </div>
      </section>

      <section id="razas" className="section section--razas" aria-labelledby="titulo-razas">
        <div className="wrap">
          <header className="section__head section__head--center">
            <h2 id="titulo-razas" className="section__title">Elige tu estandarte</h2>
            <p className="section__lead">Cuatro pueblos, cuatro maneras de ganar. Toca un escudo, conoce al pueblo y únete a su causa.</p>
          </header>
          <RaceExplorer races={races} playSlot={<PlayOnline hasAccess={access} gameUrl={GAME_URL()} variant="stone" />} />
        </div>
      </section>

      <section id="noticias" className="section section--news" aria-labelledby="titulo-noticias">
        <div className="wrap">
          <header className="section__head section__head--row">
            <h2 id="titulo-noticias" className="section__title">Últimas noticias</h2>
            {news.length > 0 && <Link href="/noticias" className="link-gold">Ver todas las noticias</Link>}
          </header>
          {news.length === 0 ? (
            <NewsEmpty />
          ) : (
            <div className="news-grid">
              {news.map((p, i) => <NewsCard key={p.slug} post={p} featured={i === 0 && news.length > 1} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
