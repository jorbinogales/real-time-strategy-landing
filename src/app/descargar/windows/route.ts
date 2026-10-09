import { NextResponse } from 'next/server';

// Descarga directa del instalador: la landing responde 302 al archivo del GitHub Release (el navegador lo baja sin mostrar GitHub).
// El nombre del archivo es fijo (MasterWar-Setup.exe) para no tocar este código en cada versión; DOWNLOAD_URL permite cambiar el origen.
export const dynamic = 'force-dynamic';
const DEFAULT_URL = 'https://github.com/jorbinogales/real-time-strategy/releases/latest/download/MasterWar-Setup.exe';

export function GET() {
  return NextResponse.redirect(process.env.DOWNLOAD_URL || DEFAULT_URL, 302);
}
