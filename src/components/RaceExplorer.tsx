'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { ResolvedRace } from '@/data/site';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function UnitCarousel({ race, playSlot, onClose }: { race: ResolvedRace; playSlot: ReactNode; onClose: () => void }) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const units = race.units;
  const last = units.length - 1;
  const people = race.name.toLowerCase();

  // Al desplegarse, el foco pasa al carrusel para que ←/→ funcionen sin buscarlo.
  useEffect(() => { track.current?.focus(); }, []);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const j = Math.min(Math.max(i, 0), last);
    el.scrollTo({ left: j * el.clientWidth, behavior: reduceMotion() ? 'auto' : 'smooth' });
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const to = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: last }[e.key];
    if (to !== undefined) { e.preventDefault(); go(to); }
  }

  return (
    <div id="carrusel-unidades" className="carousel" role="region" aria-roledescription="carrusel" aria-label={`Unidades de los ${people}`} onKeyDown={(e) => { if (e.key === 'Escape' && !(e.target as Element).closest('dialog')) onClose(); }}>
      <div className="carousel__head">
        <button type="button" className="btn-stone btn-stone--sm carousel__back" onClick={onClose}>
          <svg className="btn-stone__ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
          <span>Volver</span>
        </button>
        <h4 className="block-title carousel__title">Conoce a tus tropas</h4>
      </div>

      <div onKeyDown={onKeyDown}>
        <ul
          ref={track}
          className="carousel__track"
          tabIndex={0}
          aria-label={`${race.name}: unidad ${active + 1} de ${units.length}. Usa las flechas izquierda y derecha.`}
          onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {units.map((u, i) => (
            <li key={u.id} className="slide" data-active={i === active} role="group" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${units.length}: ${u.name}`}>
              <div className="slide__art">
                {u.img && (
                  <Image
                    src={u.img}
                    alt={`Concept art: ${u.name} de los ${people}`}
                    fill
                    loading="eager"
                    sizes="(max-width: 760px) 90vw, 640px"
                  />
                )}
              </div>
              <div className="slide__text">
                <h5 className="slide__name">{u.name}</h5>
                <p className="slide__story">{u.historia}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="carousel__controls">
          <button type="button" className="btn-stone carousel__arrow" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Unidad anterior">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
          </button>
          <ul className="carousel__dots">
            {units.map((u, i) => (
              <li key={u.id}>
                <button type="button" className="carousel__dot" onClick={() => go(i)} aria-label={`Ir a ${u.name}`} aria-current={i === active ? 'true' : undefined} />
              </li>
            ))}
          </ul>
          <button type="button" className="btn-stone carousel__arrow" onClick={() => go(active + 1)} disabled={active === last} aria-label="Unidad siguiente">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="carousel__cta">
        <p>Ya conoces a tus tropas. Ahora te toca mandarlas.</p>
        {playSlot}
      </div>

      <p className="sr" role="status" aria-live="polite" aria-atomic="true">
        {`Unidad ${active + 1} de ${units.length}: ${units[active]?.name}`}
      </p>
    </div>
  );
}

export default function RaceExplorer({ races, playSlot }: { races: ResolvedRace[]; playSlot: ReactNode }) {
  const [selected, setSelected] = useState(races[0].id);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false); // fundido de salida del banner / carrusel antes de intercambiarlos
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const join = useRef<HTMLButtonElement>(null);
  const refocusJoin = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const race = races.find((r) => r.id === selected) ?? races[0];

  useEffect(() => () => clearTimeout(timer.current), []);

  // Intercambia banner <-> unidades con un fundido corto (sin espera si el usuario reduce el movimiento).
  function swap(next: boolean) {
    clearTimeout(timer.current);
    if (reduceMotion()) { setOpen(next); return; }
    setLeaving(true);
    timer.current = setTimeout(() => { setOpen(next); setLeaving(false); }, 220);
  }

  // Cambiar de raza vuelve siempre al banner.
  function choose(id: typeof selected) {
    clearTimeout(timer.current);
    setLeaving(false);
    setSelected(id);
    setOpen(false);
  }

  function close() {
    refocusJoin.current = true;
    swap(false);
  }

  useEffect(() => {
    if (!open && refocusJoin.current) { refocusJoin.current = false; join.current?.focus(); }
  }, [open]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = races.findIndex((r) => r.id === selected);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: races.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const j = (next + races.length) % races.length;
    choose(races[j].id);
    tabs.current[j]?.focus();
  }

  return (
    <div className="race-explorer" data-race={race.id}>
      <div className="race-tabs" role="tablist" aria-label="Razas" onKeyDown={onKeyDown}>
        {races.map((r, i) => (
          <button
            key={r.id}
            ref={(el) => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`tab-${r.id}`}
            aria-selected={r.id === selected}
            aria-controls="panel-raza"
            tabIndex={r.id === selected ? 0 : -1}
            className="race-tab"
            data-race={r.id}
            onClick={() => choose(r.id)}
          >
            <span className="race-tab__shield">
              {r.shield && <Image src={r.shield} alt="" width={200} height={200} sizes="(max-width: 640px) 22vw, 190px" />}
            </span>
            <span className="race-tab__name">{r.name}</span>
          </button>
        ))}
      </div>

      <div key={race.id} className="race-panel" role="tabpanel" id="panel-raza" aria-labelledby={`tab-${race.id}`} tabIndex={0}>
        <div className="race-stage" data-leaving={leaving}>
          {open ? (
            <UnitCarousel race={race} playSlot={playSlot} onClose={close} />
          ) : (
            <header className="race-hero">
              <div className="race-hero__art">
                {race.art ? (
                  <Image src={race.art} alt={`Arte de la raza ${race.name}`} fill sizes="(max-width: 1200px) 100vw, 1200px" className="race-hero__img" />
                ) : (
                  <div className="race-hero__plain" aria-hidden="true">
                    {race.shield && <Image src={race.shield} alt="" width={200} height={200} sizes="200px" />}
                  </div>
                )}
              </div>
              <div className="race-hero__text">
                <h3 className="race-hero__name">{race.name}</h3>
                <p>{race.tagline}</p>
                <div className="race-hero__cta">
                  <button ref={join} type="button" className="btn-stone" aria-expanded="false" aria-controls="carrusel-unidades" onClick={() => swap(true)}>
                    <span>Unirse a los {race.name.toLowerCase()}</span>
                  </button>
                </div>
              </div>
            </header>
          )}
        </div>
        {/* Edificios: datos listos en races.ts (race.buildings), UI oculta por ahora. */}
      </div>
    </div>
  );
}
