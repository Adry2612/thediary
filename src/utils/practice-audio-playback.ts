type PausableAudio = {
  pause: () => void;
};

let activeAudio: PausableAudio | null = null;

export function activateExclusiveAudio(audio: PausableAudio) {
  if (activeAudio === audio) return;
  activeAudio?.pause();
  activeAudio = audio;
}

export function releaseExclusiveAudio(audio: PausableAudio) {
  if (activeAudio === audio) activeAudio = null;
}
