'use client';
import { useEffect } from 'react';

// Sonidos de interfaz (papel): abrir/avanzar = desenrollar, volver/cambiar = pasar hoja. Delegación de clics: no hace falta marcar cada botón.
const FILES = { unroll: '/sounds/paper_unroll.mp3', flip: '/sounds/paper_flip.wav' } as const;

export default function SiteSounds() {
  useEffect(() => {
    const cache: Partial<Record<keyof typeof FILES, HTMLAudioElement>> = {};
    const play = (k: keyof typeof FILES) => {
      const a = (cache[k] ||= Object.assign(new Audio(FILES[k]), { volume: 0.6 }));
      a.currentTime = 0;
      a.play().catch(() => {});
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('button, [role=tab], a.btn-stone, a.btn-hero');
      if (!el || (el as HTMLButtonElement).disabled) return;
      const label = `${el.getAttribute('aria-label') ?? ''} ${el.textContent ?? ''}`;
      if (el.matches('[role=tab], .carousel__dot, .carousel__arrow') || /volver|anterior|siguiente|cerrar|cancelar/i.test(label)) play('flip');
      else if (el.matches('.btn-stone, .btn-hero')) play('unroll');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
