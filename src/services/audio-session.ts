interface AudioSessionLike {
  type: string;
}

/**
 * En iOS, Safari silencia la Web Audio API cuando el interruptor de silencio
 * está activado. Declarar la sesión como reproducción hace que los sonidos
 * generados (metrónomo y avisos del temporizador) suenen igual que el resto del
 * audio del sistema. Es una mejora progresiva: en el resto de navegadores no
 * existe `navigator.audioSession` y no se hace nada.
 */
export function enablePlaybackAudioSession(): void {
  if (typeof navigator === "undefined") return;

  const audioSession = (
    navigator as Navigator & { audioSession?: AudioSessionLike }
  ).audioSession;
  if (!audioSession) return;

  try {
    audioSession.type = "playback";
  } catch {
    // La sesión de audio es opcional: si el navegador la rechaza, seguimos.
  }
}
