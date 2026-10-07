// Aplica las migraciones al arrancar el servidor (Node), no durante el build.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build') {
    const { getDb } = await import('@db/client');
    await getDb();
  }
}
