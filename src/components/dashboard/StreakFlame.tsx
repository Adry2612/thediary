import { useI18nSection } from "@/i18n/I18nProvider";

/** Fuego decorativo con el mensaje de racha; el SVG se oculta a lectores. */
export function StreakFlame() {
  const dashboard = useI18nSection("dashboard");

  return (
    <p className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase leading-4 tracking-[0.14em] text-[#c6ad77]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="streak-flame size-4 shrink-0"
      >
        <path
          fill="#c6ad77"
          d="M13.5 2.5c.9 2.6-.4 4.4-1.7 5.8-1.6 1.7-3.3 3.6-3.3 6.7a5.5 5.5 0 0 0 11 0c0-2.2-1-4.2-2.5-5.7.1 1.6-.5 2.7-1.4 3.3.2-3.3-1-6.6-2.1-10.1Z"
        />
        <path
          fill="#f0e3c2"
          d="M12 22a3.2 3.2 0 0 1-3.2-3.2c0-1.8 1.3-2.6 2.1-3.9.5-.8.7-1.6.7-1.6s.4.9 1 1.8c.9 1.3 2.6 2.1 2.6 3.9A3.2 3.2 0 0 1 12 22Z"
        />
      </svg>
      {dashboard.streakOnFire}
    </p>
  );
}
