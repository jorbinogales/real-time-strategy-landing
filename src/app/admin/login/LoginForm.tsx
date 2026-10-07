'use client';

import { useActionState } from 'react';
import { loginAction, type FormState } from '../actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action}>
      <label>
        Contraseña
        <input type="password" name="password" required autoComplete="current-password" />
      </label>
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}
