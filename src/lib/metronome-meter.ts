export const METRONOME_METERS = [
  {
    signature: "4/4",
    beatsPerMeasure: 4,
    beatDurationQuarterNotes: 1,
    beatUnitLabel: "Negra",
    measureUnitLabel: "4 negras",
    subdivisionUnitLabel: "Corcheas",
  },
  {
    signature: "6/8",
    beatsPerMeasure: 2,
    beatDurationQuarterNotes: 1.5,
    beatUnitLabel: "Negra con puntillo",
    measureUnitLabel: "2 negras con puntillo",
    subdivisionUnitLabel: "Corcheas",
  },
  {
    signature: "6/4",
    beatsPerMeasure: 2,
    beatDurationQuarterNotes: 3,
    beatUnitLabel: "Blanca con puntillo",
    measureUnitLabel: "2 blancas con puntillo",
    subdivisionUnitLabel: "Negras",
  },
  {
    signature: "9/8",
    beatsPerMeasure: 3,
    beatDurationQuarterNotes: 1.5,
    beatUnitLabel: "Negra con puntillo",
    measureUnitLabel: "3 negras con puntillo",
    subdivisionUnitLabel: "Corcheas",
  },
  {
    signature: "9/4",
    beatsPerMeasure: 3,
    beatDurationQuarterNotes: 3,
    beatUnitLabel: "Blanca con puntillo",
    measureUnitLabel: "3 blancas con puntillo",
    subdivisionUnitLabel: "Negras",
  },
  {
    signature: "12/8",
    beatsPerMeasure: 4,
    beatDurationQuarterNotes: 1.5,
    beatUnitLabel: "Negra con puntillo",
    measureUnitLabel: "4 negras con puntillo",
    subdivisionUnitLabel: "Corcheas",
  },
  {
    signature: "12/4",
    beatsPerMeasure: 4,
    beatDurationQuarterNotes: 3,
    beatUnitLabel: "Blanca con puntillo",
    measureUnitLabel: "4 blancas con puntillo",
    subdivisionUnitLabel: "Negras",
  },
] as const;

export type MetronomeMeter = (typeof METRONOME_METERS)[number];
export type MetronomeMeterSignature = MetronomeMeter["signature"];

export function isMetronomeMeterSignature(
  value: string,
): value is MetronomeMeterSignature {
  return METRONOME_METERS.some((meter) => meter.signature === value);
}

export interface MetronomeSubdivisionOption {
  value: number;
  label: string;
  shortLabel: string;
}

export function getMetronomeMeter(
  signature: MetronomeMeterSignature,
): MetronomeMeter {
  const meter = METRONOME_METERS.find(
    (candidate) => candidate.signature === signature,
  );
  if (!meter) throw new Error(`Compás de metrónomo no admitido: ${signature}`);

  return meter;
}

export function getMetronomeSubdivisionOptions(
  meter: MetronomeMeter,
): MetronomeSubdivisionOption[] {
  if (meter.signature === "4/4") {
    return [
      { value: 1, label: "Negras · 1/4", shortLabel: "Negras" },
      { value: 2, label: "Corcheas · 1/8", shortLabel: "Corcheas" },
      { value: 3, label: "Tresillos · 1/8T", shortLabel: "Tresillos" },
      { value: 4, label: "Semicorcheas · 1/16", shortLabel: "Semicorcheas" },
    ];
  }

  return [
    {
      value: 1,
      label: `${meter.beatUnitLabel} · pulso`,
      shortLabel: "Pulso",
    },
    {
      value: 2,
      label: "2 subdivisiones por pulso",
      shortLabel: "2 por pulso",
    },
    {
      value: 3,
      label: `${meter.subdivisionUnitLabel} · 3 por pulso`,
      shortLabel: meter.subdivisionUnitLabel,
    },
    {
      value: 4,
      label: "4 subdivisiones por pulso",
      shortLabel: "4 por pulso",
    },
  ];
}
