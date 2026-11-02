import type { AlphaTabApi } from "@coderline/alphatab";

type AlphaTabModule = typeof import("@coderline/alphatab");
type AlphaTabScore = NonNullable<AlphaTabApi["score"]>;

export type TabEmptyBeat = { bar: number; beat: number };

/**
 * Posiciones de los pulsos vacíos de una partitura, para poder distinguirlos
 * del silencio al dibujar. AlphaTex no tiene un pulso vacío propio: el
 * importador convierte `()` en un silencio, así que se marcan después de
 * importar y se oculta su figura.
 */
export function getEmptyBeats(score: {
  bars: { beats: { empty?: true }[] }[];
}): TabEmptyBeat[] {
  const positions: TabEmptyBeat[] = [];
  score.bars.forEach((bar, barIndex) => {
    bar.beats.forEach((beat, beatIndex) => {
      if (beat.empty === true) {
        positions.push({ bar: barIndex, beat: beatIndex });
      }
    });
  });
  return positions;
}

/**
 * Marca los pulsos vacíos en la partitura importada y hace transparente su
 * figura de silencio: ocupan su tiempo, pero no se dibujan como silencio.
 */
export function markEmptyBeats(
  alphaTab: AlphaTabModule,
  score: AlphaTabScore,
  positions: TabEmptyBeat[],
): void {
  for (const position of positions) {
    const beat = score.tracks[0]?.staves[0]?.bars[position.bar]?.voices[0]
      ?.beats[position.beat];
    if (!beat) continue;

    beat.isEmpty = true;
    const style = beat.style ?? new alphaTab.model.BeatStyle();
    const transparent = new alphaTab.model.Color(0, 0, 0, 0);
    style.colors.set(
      alphaTab.model.BeatSubElement.GuitarTabRests,
      transparent,
    );
    style.colors.set(
      alphaTab.model.BeatSubElement.StandardNotationRests,
      transparent,
    );
    beat.style = style;
  }
}
