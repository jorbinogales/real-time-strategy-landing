import { useId } from 'react';
import { LOGO } from './logo-data';

type Props = {
  /** full = emblema + palabra, emblem = solo escudo (móvil, icono), word = solo palabra */
  variant?: 'full' | 'emblem' | 'word';
  className?: string;
  /** true cuando el nombre ya está en el texto de al lado (evita leerlo dos veces) */
  decorative?: boolean;
};

const VIEWBOX = { full: LOGO.fullViewBox, emblem: LOGO.emblemViewBox, word: LOGO.wordViewBox } as const;

export default function Logo({ variant = 'full', className, decorative = false }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const withEmblem = variant !== 'word';
  const withWord = variant !== 'emblem';
  const t = LOGO.textPath;
  const ox = variant === 'full' ? LOGO.wordOffset : 0;
  const markup =
    `<defs>${withWord ? LOGO.wordDefs(id) : ''}</defs>` +
    (withEmblem ? '<image href="/brand/masterwar-icon-512.png" x="-6" y="-3" width="118" height="118"/>' : '') +   // emblema: icono generado por Codex
    (withWord
      ? `<g transform="translate(${ox} 0)">` +
        `<path d="${t}" fill="#2a160a" stroke="#2a160a" stroke-width="15" stroke-linejoin="round" transform="translate(0 6)"/>` +
        `<path d="${t}" fill="#2a160a" stroke="#2a160a" stroke-width="15" stroke-linejoin="round"/>` +
        `<path d="${t}" fill="url(#${id}w)"/></g>`
      : '');
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEWBOX[variant]}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'MasterWar'}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
