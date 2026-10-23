export const PRACTICE_SOUND_OPTIONS = [
  { value: 'voice', label: 'Voz' },
  { value: 'alarm', label: 'Alarma' },
  { value: 'bell', label: 'Campana' },
] as const;

export type PracticeSound = (typeof PRACTICE_SOUND_OPTIONS)[number]['value'];

export function isPracticeSound(value: string): value is PracticeSound {
  return PRACTICE_SOUND_OPTIONS.some((option) => option.value === value);
}
