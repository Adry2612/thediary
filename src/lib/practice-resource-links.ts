const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const YOUTUBE_ID_PATTERN = /^[\w-]{6,20}$/;
const SPOTIFY_HOSTS = new Set(["open.spotify.com"]);
const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{10,30}$/;

function parseHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function matchId(candidate: string | null | undefined, pattern: RegExp) {
  return candidate && pattern.test(candidate) ? candidate : null;
}

export function extractYoutubeVideoId(value: string): string | null {
  const url = parseHttpsUrl(value);
  if (!url) return null;
  if (url.hostname === "youtu.be") {
    return matchId(url.pathname.split("/")[1], YOUTUBE_ID_PATTERN);
  }
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;
  if (url.pathname === "/watch") {
    return matchId(url.searchParams.get("v"), YOUTUBE_ID_PATTERN);
  }
  const [, route, id] = url.pathname.split("/");
  if (route !== "embed" && route !== "shorts" && route !== "v") return null;
  return matchId(id, YOUTUBE_ID_PATTERN);
}

export function extractSpotifyTrackId(value: string): string | null {
  const url = parseHttpsUrl(value);
  if (!url || !SPOTIFY_HOSTS.has(url.hostname)) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const trackIndex = parts.indexOf("track");
  if (trackIndex === -1) return null;
  return matchId(parts[trackIndex + 1], SPOTIFY_ID_PATTERN);
}
