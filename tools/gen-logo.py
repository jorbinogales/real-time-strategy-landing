"""Genera la marca MasterWar (texto a curvas, sin depender de fuentes en runtime).
Escribe public/brand/masterwar-logo.svg, masterwar-emblema.svg, src/app/icon.svg y src/components/logo-data.ts.
Uso: python tools/gen-logo.py <fuente.woff2> [outdir]
Requiere fonttools + brotli solo para regenerar (no son dependencias del sitio)."""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font = TTFont(sys.argv[1]); gs = font.getGlyphSet(); cmap = font.getBestCmap()
root = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..')
CAP, SP, BASE, EW, EH, GAP, PAD = 60.0, 5.0, 86.0, 100.0, 112.0, 14.0, 9.0
s = CAP / (font['OS/2'].sCapHeight or font['head'].unitsPerEm * 0.7)
x = 0.0; d = []
for ch in 'MASTERWAR':
    g = cmap[ord(ch)]
    pen = SVGPathPen(gs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
    gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, BASE)))
    d.append(pen.getCommands()); x += gs[g].width * s + SP
TW = round(x - SP, 1); TEXT = ''.join(d)

OL = '#2a160a'
EMB_DEFS = lambda i: f'''<linearGradient id="{i}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#f2b724"/><stop offset="1" stop-color="#b9780f"/></linearGradient><linearGradient id="{i}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#858996"/><stop offset=".55" stop-color="#5b5f6b"/><stop offset="1" stop-color="#43464f"/></linearGradient>'''
def emblem(i):  # 100 x 112
    return f'''<path d="M50 8 94 20V54C94 82 74 100 50 108 26 100 6 82 6 54V20Z" fill="url(#{i}g)" stroke="{OL}" stroke-width="8" stroke-linejoin="round"/><path d="M50 19 83 28V54C83 75 68 90 50 97 32 90 17 75 17 54V28Z" fill="url(#{i}s)" stroke="{OL}" stroke-width="4" stroke-linejoin="round"/><path d="M50 24 57 36V66H43V36Z" fill="#fff3d6" stroke="{OL}" stroke-width="3.5" stroke-linejoin="round"/><path d="M32 66H68V73H32Z" fill="url(#{i}g)" stroke="{OL}" stroke-width="3.5" stroke-linejoin="round"/><path d="M46.5 73H53.5V83H46.5Z" fill="#b9780f" stroke="{OL}" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="86.5" r="4.6" fill="url(#{i}g)" stroke="{OL}" stroke-width="3"/>'''
def word(i, ox):
    return f'''<g transform="translate({ox} 0)"><path d="{TEXT}" fill="{OL}" stroke="{OL}" stroke-width="15" stroke-linejoin="round" transform="translate(0 6)"/><path d="{TEXT}" fill="{OL}" stroke="{OL}" stroke-width="15" stroke-linejoin="round"/><path d="{TEXT}" fill="url(#{i}w)"/></g>'''
WORD_DEFS = lambda i: f'''<linearGradient id="{i}w" gradientUnits="userSpaceOnUse" x1="0" y1="{BASE-CAP}" x2="0" y2="{BASE}"><stop offset="0" stop-color="#fff3b0"/><stop offset=".48" stop-color="#f2b724"/><stop offset=".5" stop-color="#e0a01a"/><stop offset="1" stop-color="#b9780f"/></linearGradient>'''
OX = EW + GAP
VBX0, VBY0 = -PAD, -PAD * 0.4
FULL_W = OX + TW + 2 * PAD; FULL_H = EH + PAD * 1.2 + 6
def svg(vb, body, label):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{label}">{body}</svg>\n'
full_vb = f'{VBX0} {VBY0} {FULL_W:.1f} {FULL_H:.1f}'
emb_vb = f'-6 -6 {EW+12} {EH+12}'
full = svg(full_vb, f'<defs>{EMB_DEFS("a")}{WORD_DEFS("a")}</defs>{emblem("a")}{word("a", OX)}', 'MasterWar')
emb = svg(emb_vb, f'<defs>{EMB_DEFS("a")}</defs>{emblem("a")}', 'MasterWar')
ico = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 124"><defs>{EMB_DEFS("a")}</defs>{emblem("a")}</svg>\n'
for p, c in (('public/brand/masterwar-logo.svg', full), ('public/brand/masterwar-emblema.svg', emb), ('src/app/icon.svg', ico)):
    os.makedirs(os.path.dirname(os.path.join(root, p)), exist_ok=True)
    open(os.path.join(root, p), 'w', encoding='utf-8').write(c)
ts = f'''// Generado por tools/gen-logo.py: no editar a mano.
export const LOGO = {{
  fullViewBox: '{full_vb}',
  emblemViewBox: '{emb_vb}',
  wordViewBox: '{-PAD} {BASE-CAP-PAD:.1f} {TW+2*PAD:.1f} {CAP+6+2*PAD:.1f}',
  wordOffset: {OX},
  textPath: '{TEXT}',
  base: {BASE},
  cap: {CAP},
  emblem: (id: string) => `{emblem("${id}")}`,
  emblemDefs: (id: string) => `{EMB_DEFS("${id}")}`,
  wordDefs: (id: string) => `{WORD_DEFS("${id}")}`,
}} as const;
'''
os.makedirs(os.path.join(root, 'src/components'), exist_ok=True)
open(os.path.join(root, 'src/components/logo-data.ts'), 'w', encoding='utf-8').write(ts)
print('ratio full', round(FULL_W / FULL_H, 3), 'text w', TW)
