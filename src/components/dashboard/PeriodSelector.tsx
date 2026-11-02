"use client";

import { ToggleChip } from "@/components/ui/ToggleChip";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { PracticeChartPeriod } from "@/utils/practice-analytics";

/** Botones de periodo compartidos por los gráficos y balances del Panel. */
export function PeriodSelector({
  period,
  onChange,
  ariaLabel,
}: {
  period: PracticeChartPeriod;
  onChange: (period: PracticeChartPeriod) => void;
  ariaLabel: string;
}) {
  const dashboard = useI18nSection("dashboard");
  const options: Array<{ value: PracticeChartPeriod; label: string }> = [
    {
      value: "week",
      label: dashboard.periodWeek ?? dashboard.period,
    },
    {
      value: "month",
      label: dashboard.periodMonth ?? dashboard.period,
    },
    {
      value: "year",
      label: dashboard.periodYear ?? dashboard.period,
    },
  ];

  return (
    <ToggleGroup aria-label={ariaLabel} layout="wrap" className="gap-1.5">
      {options.map((option) => (
        <ToggleChip
          key={option.value}
          size="sm"
          selected={period === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </ToggleChip>
      ))}
    </ToggleGroup>
  );
}
