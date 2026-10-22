import { useI18nSection } from "@/i18n/I18nProvider";
import { getLickTechnique } from "@/lib/licks/techniques";
import type { TechniqueId } from "@/types/lick";

export function TechniqueBadges({
  techniques,
  showEmpty = false,
  className = "",
}: {
  techniques: TechniqueId[];
  showEmpty?: boolean;
  className?: string;
}) {
  const text = useI18nSection("licks");

  if (techniques.length === 0) {
    return showEmpty ? (
      <span className={`text-xs text-muted ${className}`}>
        {text.noTechniques}
      </span>
    ) : null;
  }

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {techniques.map((id) => {
        const descriptor = getLickTechnique(id);
        if (!descriptor) return null;
        const label = text[descriptor.labelKey] ?? id;
        return (
          <li
            key={id}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11px] text-muted"
          >
            <span aria-hidden="true" className="font-mono text-[10px] text-accent-green-fg">
              {descriptor.glyph}
            </span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}
