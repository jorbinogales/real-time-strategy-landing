'use client';

import { useId, useRef, useState } from 'react';

const PlayIcon = ({ stone }: { stone: boolean }) => (
  <svg className={stone ? 'btn-stone__ico btn-stone__ico--fill' : 'btn-hero__ico'} viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>
);

// Si ya hay cookie de acceso (hasAccess), el botón entra directo; si no, abre el formulario de correo.
// variant 'hero': boton dorado del banner principal; 'stone': boton de piedra (carrusel).
export default function PlayOnline({ hasAccess, gameUrl, variant = 'hero' }: { hasAccess: boolean; gameUrl: string; variant?: 'hero' | 'stone' }) {
  const stone = variant === 'stone';
  const cls = stone ? 'btn-stone' : 'btn-hero btn-play';
  const dialog = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  if (hasAccess) {
    return (
      <a className={cls} href={gameUrl}>
        <PlayIcon stone={stone} />
        <span>JUGAR ONLINE</span>
      </a>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    if (!emailRef.current?.checkValidity()) {
      setFieldError(emailRef.current?.value ? 'Revisa el correo: parece incompleto.' : 'Escribe tu correo para entrar.');
      emailRef.current?.focus();
      return;
    }
    setFieldError(null);
    setPending(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fd.get('email'),
          marketing: fd.get('marketing') === 'on',
          website: fd.get('website'),
          campaign: new URLSearchParams(location.search).get('utm_campaign'),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok && data.gameUrl) {
        setDone(true);
        window.location.href = data.gameUrl;
        return;
      }
      setError(data?.message ?? 'No se pudo completar la solicitud. Inténtalo de nuevo.');
    } catch {
      setError('Sin conexión. Inténtalo de nuevo.');
    }
    setPending(false);
  }

  const close = () => dialog.current?.close();
  const emailErrId = `${uid}-email-err`;

  return (
    <>
      <button type="button" className={cls} onClick={() => dialog.current?.showModal()}>
        <PlayIcon stone={stone} />
        <span>JUGAR ONLINE</span>
      </button>
      <dialog
        ref={dialog}
        className="modal"
        aria-labelledby={`${uid}-title`}
        onClose={() => { setError(null); setFieldError(null); }}
        onClick={(e) => { if (e.target === dialog.current) close(); }}
      >
        <div className="modal__panel">
          <button type="button" className="btn-stone modal__x" onClick={close} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>

          {done ? (
            <div className="modal__done" role="status">
              <span className="modal__check" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
              </span>
              <h2 id={`${uid}-title`}>¡Listo, soldado!</h2>
              <p>Entrando al campo de batalla…</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate aria-busy={pending}>
              <h2 id={`${uid}-title`} className="modal__title">Jugar online</h2>
              <p className="modal__lead">Escribe tu correo y entras directo al juego.</p>

              <div className="field">
                <label htmlFor={`${uid}-email`}>Correo electrónico</label>
                <input
                  ref={emailRef}
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  placeholder="nombre@ejemplo.com"
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby={fieldError ? emailErrId : undefined}
                  disabled={pending}
                />
                {fieldError && <p id={emailErrId} className="field__error">{fieldError}</p>}
              </div>

              {/* Honeypot: invisible para personas; los bots lo rellenan. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
                <label>No rellenar <input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>

              <label className="check">
                <input type="checkbox" name="marketing" disabled={pending} />
                <span className="check__box" aria-hidden="true" />
                <span>Quiero recibir noticias del juego por correo (opcional)</span>
              </label>

              <p className="modal__fine">Guardamos tu correo solo para darte acceso. Puedes pedir su borrado cuando quieras.</p>

              {error && <p role="alert" className="modal__error">{error}</p>}

              <div className="modal__actions">
                <button type="submit" className="btn-stone btn-stone--sm" disabled={pending}>
                  <span>{pending ? 'Entrando…' : 'Entrar al juego'}</span>
                  {pending && <span className="spinner" aria-hidden="true" />}
                </button>
                <button type="button" className="btn-stone btn-stone--sm" onClick={close} disabled={pending}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
