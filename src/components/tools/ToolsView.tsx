"use client";

import { DelayCalculatorPanel } from "@/components/tools/DelayCalculatorPanel";
import { ToneGeneratorPanel } from "@/components/tools/ToneGeneratorPanel";
import { ToolSection } from "@/components/tools/ToolSection";
import { TunerPanel } from "@/components/tools/TunerPanel";
import { MetronomeCard } from "@/components/practice/MetronomeCard";
import { StringsPanel } from "@/components/tools/StringsPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { useI18nSection } from "@/i18n/I18nProvider";

export function ToolsView({ todayKey }: { todayKey: string }) {
  const text = useI18nSection("tools");
  const equipment = useI18nSection("equipment");

  return (
    <PageShell>
      <PageHeader title={text.title} description={text.description} />

      {/*
        Dos columnas solo cuando hay ancho de sobra: el afinador necesita sitio
        para la aguja y la calculadora para su tabla. Por debajo de `xl` cada
        herramienta ocupa su fila. Las cuerdas van a ancho completo porque son
        una lista de filas, no un panel.
      */}
      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <ToolSection
          id="tools-metronome"
          eyebrow={text.eyebrowRhythm}
          title={text.tabMetronome}
          description={text.metronomeDescription}
        >
          <MetronomeCard variant="block" />
        </ToolSection>

        <ToolSection
          id="tools-tuner"
          eyebrow={text.eyebrowTuning}
          title={text.tunerTitle}
          description={text.tunerDescription}
        >
          <TunerPanel active />
        </ToolSection>

        <ToolSection
          id="tools-tones"
          eyebrow={text.eyebrowTones}
          title={text.toneTitle}
          description={text.toneDescription}
        >
          <ToneGeneratorPanel />
        </ToolSection>

        <ToolSection
          id="tools-calculator"
          eyebrow={text.eyebrowCalculator}
          title={text.calculatorTitle}
          description={text.calculatorDescription}
        >
          <DelayCalculatorPanel />
        </ToolSection>

        <ToolSection
          id="tools-strings"
          eyebrow={text.eyebrowStrings}
          title={equipment.title}
          description={equipment.description}
          className="scroll-mt-24 xl:col-span-2"
        >
          <StringsPanel todayKey={todayKey} />
        </ToolSection>
      </div>
    </PageShell>
  );
}
