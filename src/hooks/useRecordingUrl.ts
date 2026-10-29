"use client";

import { useEffect, useState } from "react";

interface RecordingSource {
  blob?: Blob;
  playbackUrl?: string;
}

/** URL reproducible de una toma: la de la nube si existe o un object URL local. */
export function useRecordingUrl(recording: RecordingSource | null) {
  const [url, setUrl] = useState<string | null>(null);
  const blob = recording?.blob;
  const playbackUrl = recording?.playbackUrl;

  useEffect(() => {
    if (!blob && !playbackUrl) {
      setUrl(null);
      return;
    }
    if (playbackUrl) {
      setUrl(playbackUrl);
      return;
    }
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob, playbackUrl]);

  return url;
}
