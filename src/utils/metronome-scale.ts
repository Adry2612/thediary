export type MetronomeScaleZone = "edge" | "transition" | "active";

export interface TempoMarking {
  name: string;
  minBpm: number;
  maxBpm?: number;
}

export const METRONOME_SCALE_ZONE_COLORS: Record<
  MetronomeScaleZone,
  string
> = {
  edge: "#e5aeb8",
  transition: "#e7d09f",
  active: "#afd0ae",
};

const TEMPO_MARKINGS: TempoMarking[] = [
  { name: "Largo", minBpm: 40, maxBpm: 60 },
  { name: "Larghetto", minBpm: 60, maxBpm: 66 },
  { name: "Adagio", minBpm: 66, maxBpm: 76 },
  { name: "Andante", minBpm: 76, maxBpm: 108 },
  { name: "Moderato", minBpm: 108, maxBpm: 120 },
  { name: "Allegro", minBpm: 120, maxBpm: 168 },
  { name: "Presto", minBpm: 168, maxBpm: 200 },
  { name: "Prestissimo", minBpm: 200 },
];

export function getMetronomeScaleZone(position: number): MetronomeScaleZone {
  const normalizedPosition = Math.max(0, Math.min(1, position));

  if (normalizedPosition < 0.2 || normalizedPosition > 0.8) {
    return "edge";
  }
  if (normalizedPosition < 0.4 || normalizedPosition > 0.6) {
    return "transition";
  }
  return "active";
}

export function getTempoMarking(bpm: number): TempoMarking {
  if (!Number.isFinite(bpm)) {
    throw new RangeError("El tempo debe ser un número finito.");
  }

  const normalizedBpm = Math.max(TEMPO_MARKINGS[0].minBpm, bpm);
  const marking = TEMPO_MARKINGS.find(
    ({ minBpm, maxBpm }) =>
      normalizedBpm >= minBpm &&
      (maxBpm === undefined || normalizedBpm < maxBpm),
  );

  if (!marking) {
    throw new RangeError(`No hay una equivalencia musical para ${bpm} BPM.`);
  }
  return marking;
}
