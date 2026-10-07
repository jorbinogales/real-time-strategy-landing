// Constantes de marca y resolución de imágenes (solo servidor: usa fs).
// Cambiar el hero definitivo: editar HERO_IMAGE. Si el archivo aún no existe se usa HERO_FALLBACK.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { RACES, type Race } from './races';

export const HERO_IMAGE = '/images/hero/hero-humanos-vs-orcos.jpg';
export const HERO_FALLBACK = '/images/_fallback/hero.jpg';

const exists = (publicPath: string) => existsSync(path.join(process.cwd(), 'public', publicPath));
const pick = (...candidates: (string | null | undefined)[]) => candidates.find((c) => c && exists(c)) ?? null;

export const heroSrc = () => pick(HERO_IMAGE, HERO_FALLBACK) ?? HERO_FALLBACK;

// Misma forma que Race, pero cada imagen apunta a un archivo que existe (o null).
export type ResolvedRace = Omit<Race, 'shield' | 'shieldFallback' | 'image' | 'units' | 'buildings'> & {
  shield: string | null;
  art: string | null;
  units: (Race['units'][number] & { img: string | null })[];
  buildings: (Race['buildings'][number] & { img: string | null })[];
};

export function resolveRaces(): ResolvedRace[] {
  return RACES.map((r) => ({
    id: r.id, name: r.name, tagline: r.tagline,
    shield: pick(r.shield, r.shieldFallback),
    art: pick(r.image),
    units: r.units.map((u) => ({ ...u, img: pick(u.image, u.fallbackImage) })),
    buildings: r.buildings.map((b) => ({ ...b, img: pick(b.image, b.fallbackImage) })),
  }));
}
