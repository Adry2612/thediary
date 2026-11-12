import { useI18nSection } from "@/i18n/I18nProvider";

/** Medalla decorativa para la racha que ya es la más larga del historial. */
export function StreakRecord() {
  const dashboard = useI18nSection("dashboard");

  return (
    <p className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase leading-4 tracking-[0.14em] text-[#c6ad77]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 shrink-0"
      >
        <path fill="#c6ad77" d="M7.5 2h3l1.5 5h-3L7.5 2Z" />
        <path fill="#f0e3c2" d="M13.5 2h3L15 7h-3l1.5-5Z" />
        <circle cx="12" cy="15" r="6.5" fill="#c6ad77" />
        <circle cx="12" cy="15" r="4.75" fill="#f0e3c2" />
        <path
          fill="#c6ad77"
          d="m12 12.4.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3.9-1.8Z"
        />
      </svg>
      {dashboard.streakRecordBadge}
    </p>
  );
}
