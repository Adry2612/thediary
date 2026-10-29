import type { MetronomeMeterSignature } from "@/utils/metronome-meter";
import type { MetronomeVoice } from "@/utils/metronome-voice";
import type { TempoRampSettings } from "@/utils/metronome-tempo-ramp";

/** Lo que los ajustes del metrónomo reciben y pueden cambiar. */
export interface MetronomeSettingsProps {
  subdivision: number;
  volume: number;
  meterSignature: MetronomeMeterSignature;
  tempoRamp: TempoRampSettings;
  voice: MetronomeVoice;
  setSubdivision: (subdivision: number) => void;
  setVolume: (volume: number) => void;
  setMeterSignature: (signature: MetronomeMeterSignature) => void;
  setTempoRamp: (settings: TempoRampSettings) => void;
  setVoice: (voice: MetronomeVoice) => void;
}
