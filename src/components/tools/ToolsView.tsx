"use client";

import Link from "next/link";
import { DelayCalculatorPanel } from "@/components/tools/DelayCalculatorPanel";
import { ToneGeneratorPanel } from "@/components/tools/ToneGeneratorPanel";
import { ToolSection } from "@/components/tools/ToolSection";
import { TunerPanel } from "@/components/tools/TunerPanel";
import { MetronomeCard } from "@/components/practice/MetronomeCard";
import { StringsPanel } from "@/components/tools/StringsPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { useI18nSection } from "@/i18n/I18nProvider";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { interpolate } from "@/utils/interpolate";

export function ToolsView({ todayKey }: { todayKey: string }) {
  const text = useI18nSection("tools");
  const equipment = useI18nSection("equipment");
  const materials = useI18nSection("materials");
  const studyMaterials = usePracticeStore((state) => state.studyMaterials);
  const materialCount = studyMaterials.length;
  const materialCountLabel = interpolate(
    materialCount === 1 ? materials.countOne : materials.countMany,
    { count: materialCount },
  );

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

        <ToolSection
          id="tools-materials"
          eyebrow={materials.eyebrow}
          title={materials.title}
          description={materials.description}
          className="scroll-mt-24 xl:col-span-2"
          status={
            <Link
              href="/materials"
              className="inline-flex h-11 items-center justify-center border border-line px-4 text-sm text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
            >
              {materials.openLibrary}
            </Link>
          }
        >
          <p className="text-sm text-muted">{materialCountLabel}</p>
        </ToolSection>
      </div>
    </PageShell>
  );
}
