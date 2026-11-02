export type AudioResumeInput = {
  isActive: boolean;
  isVisible: boolean;
};

export type AudioSessionState = "active" | "interrupted" | "inactive" | "unknown";

export type AudioSessionLike = {
  state?: string;
  addEventListener?: (
    type: "statechange",
    listener: () => void,
  ) => void;
  removeEventListener?: (
    type: "statechange",
    listener: () => void,
  ) => void;
};

/** Solo se reanuda una herramienta que estaba sonando al volver a la página. */
export function shouldResumeAudio({
  isActive,
  isVisible,
}: AudioResumeInput): boolean {
  return isActive && isVisible;
}

/**
 * Normaliza el estado de la Audio Session API. Safari expone `interrupted`
 * cuando el sistema corta el audio (bloqueo de pantalla, llamada, otra app),
 * aunque el `AudioContext` siga diciendo `running`.
 */
export function normalizeAudioSessionState(
  value: string | undefined,
): AudioSessionState {
  if (value === "active" || value === "interrupted" || value === "inactive") {
    return value;
  }
  return "unknown";
}

export function getAudioSession(): AudioSessionLike | null {
  if (typeof navigator === "undefined") return null;
  const session = (navigator as Navigator & { audioSession?: AudioSessionLike })
    .audioSession;
  return session ?? null;
}

export function getAudioSessionState(): AudioSessionState {
  return normalizeAudioSessionState(getAudioSession()?.state);
}

/**
 * iOS y iPadOS (incluido Chrome, que usa WebKit) no siempre reanudan la Web
 * Audio sin un gesto tras bloquear la pantalla, aunque el contexto diga
 * `running`. En esas plataformas se ofrece siempre la acción explícita.
 */
export function isIOSWebKit(
  userAgent: string,
  platform: string,
  maxTouchPoints: number,
): boolean {
  if (/iPad|iPhone|iPod/.test(userAgent)) return true;
  return platform === "MacIntel" && maxTouchPoints > 1;
}

/**
 * Indica si hace falta un gesto del usuario para recuperar el sonido. Un
 * contexto `running` no basta en iOS: la sesión puede seguir interrumpida.
 */
export function needsAudioGesture(
  contextState: string,
  sessionState: AudioSessionState,
): boolean {
  if (contextState !== "running") return true;
  return sessionState === "interrupted" || sessionState === "inactive";
}
