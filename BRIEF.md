# Sitio web del videojuego MasterWar (rts-landing)

Proyecto **independiente** del juego (`C:/dev/rts`): todo lo de este sitio es único y exclusivo de aquí.
El juego se llama **MasterWar** (una palabra; antes «Cuatro Estandartes»). Es un RTS 3D en Three.js, en español, con 4 razas: humanos, orcos, elfos y enanos.

## Petición original del usuario (resumen fiel)

Crear un sitio web para el videojuego.

1. **Call to action** (hero): dos botones
   - **JUGAR ONLINE** — para poder jugar online la persona debe **agregar su correo** (captura de email antes de entrar).
   - **DESCARGAR PARA WINDOWS** — más adelante se trabajará la descarga; por ahora solo el botón (estado "próximamente").
   - Imagen principal generada por **Codex**: arte visual del juego, una **pelea entre humanos y orcos**.
2. **Sección de razas** (se hace después del hero):
   - Se muestra el **escudo de cada raza en Full HD**.
   - Al hacer clic en una raza: información de **cada unidad con su imagen HD** y del **edificio con su imagen HD**.
   - Cada raza tiene una **imagen general artística** generada por **Codex** (presentación de la raza).
3. **Sección de noticias**: cada actualización del juego se publica como post.
4. **Base de datos** para guardar los **correos** y los **posts** de noticias.

## Reparto del equipo (reglas globales del usuario)
- Diseño visual / UI → L.E.O.A.R.T (`designer`).
- Esquema de datos → J.O.R.B.I (`data-engineer`) **antes** de implementar.
- Implementación → D.A.N.I (`fullstack`).
- Imágenes de arte → chat de Codex (herdr, panel `w6:p1`).

## Fuentes de contenido del juego (solo lectura, no copiar sin necesidad)
- Definición de razas, unidades, edificios, costos y stats: `C:/dev/rts/index.html` (objeto `RACES`, ~línea 1650-1800).
- Retratos de unidades: `C:/dev/rts/assets/units/<raza>/<unidad>.png` (razas: human, orc, elf, dwarf).
- Iconos de edificios: `C:/dev/rts/assets/ui/<raza>/icon-*.png`.
- Emblemas de raza: `C:/dev/rts/assets/ui/general/emblema-{human,orc,elf,dwarf}.png`.
- Arte del menú del juego: `C:/dev/rts/assets/ui/menu/fondo-batalla.jpg`.
- Estilo visual del juego: caricatura / toon, madera + oro + piedra (ver menu.html del juego).

## Decisiones tomadas (por defecto, revisables)
- Idioma del sitio: español.
- Stack: Next.js (App Router) + TypeScript; base de datos decidida por J.O.R.B.I (ver `docs/schema.md`).
- El juego online vive en `C:/dev/rts` (index.html / menu.html); este sitio solo enlaza a él tras capturar el correo.
