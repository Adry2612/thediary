import { formatPracticeDuration, getBarPercentage } from "@/utils/dashboard-data";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { ArtistPracticeStats } from "@/utils/repertoire-analytics";

export function ArtistRanking({ artists }: { artists: ArtistPracticeStats[] }) {
  const text = useI18nSection("repertoire");
  const topArtists = artists.slice(0, 5);

  if (topArtists.length === 0) return null;

  const maximumSeconds = topArtists[0]?.practiceSeconds ?? 0;

  return (
    <section className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">
        {text.artistRankingEyebrow}
      </p>
      <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-ink sm:text-xl sm:leading-8">
        {text.artistRankingTitle}
      </h2>

      <ul className="mt-5 space-y-4">
        {topArtists.map((artist) => (
          <li key={artist.artist}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-sm text-ink">
                {artist.artist}
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-400">
                {formatPracticeDuration(artist.practiceSeconds / 60)}
              </span>
            </div>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-canvas">
              <span
                className="block h-full rounded-full bg-[#6d8c72]"
                style={{
                  width: `${getBarPercentage(artist.practiceSeconds, maximumSeconds)}%`,
                }}
              />
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.1em] text-muted">
              {artist.songCount}{" "}
              {artist.songCount === 1 ? text.artistSong : text.artistSongs}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
