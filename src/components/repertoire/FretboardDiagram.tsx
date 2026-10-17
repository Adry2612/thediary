"use client";

import { getFretWindow, STRING_COUNT } from "@/lib/chords";
import type { ChordShape } from "@/types/practice";

interface FretboardDiagramProps {
  shape: ChordShape;
  name?: string;
  context?: number;
  size?: "sm" | "md";
  interactive?: boolean;
  /** Ventana de trastes a dibujar; si no se pasa, se ajusta a la forma. */
  fretWindow?: { start: number; count: number };
  onToggleFret?: (stringIndex: number, fret: number) => void;
  onToggleOpen?: (stringIndex: number) => void;
  className?: string;
}

/**
 * Diagrama de acorde vertical (cejuela arriba, cuerdas en vertical, de la 6ª a
 * la 1ª de izquierda a derecha) que solo dibuja los trastes usados más contexto.
 */
export function FretboardDiagram({
  shape,
  name,
  context = 1,
  size = "md",
  interactive = false,
  fretWindow,
  onToggleFret,
  onToggleOpen,
  className = "",
}: FretboardDiagramProps) {
  const isSmall = size === "sm";
  const gap = isSmall ? 15 : 20;
  const fretHeight = isSmall ? 16 : 22;
  const markerHeight = isSmall ? 13 : 16;
  const sidePad = 8;
  const fontSize = isSmall ? 7 : 9;

  const { start, count } = fretWindow ?? getFretWindow(shape, context);
  const baseFretPad = isSmall ? 16 : 22;
  const left = start > 1 ? baseFretPad : sidePad;
  const gridRight = left + (STRING_COUNT - 1) * gap;
  const gridTop = markerHeight;
  const gridBottom = gridTop + count * fretHeight;
  // Con la etiqueta del traste base se reserva lo mismo a la derecha, para que
  // la cuadrícula quede centrada.
  const width = gridRight + (start > 1 ? baseFretPad : sidePad);
  const height = gridBottom + 4;
  const dotRadius = isSmall ? 3.5 : 4.5;

  function handleKey(
    event: React.KeyboardEvent<SVGRectElement>,
    action: () => void,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  }

  return (
    <figure className={className}>
      {name && (
        <figcaption
          className={`mb-1 text-center font-medium text-ink ${isSmall ? "text-[11px]" : "text-sm"}`}
        >
          {name}
        </figcaption>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={name ? `Acorde ${name}` : "Diagrama de acorde"}
        className="block text-ink"
      >
        {Array.from({ length: count + 1 }, (_, index) => {
          const isNut = index === 0 && start === 1;
          return (
            <line
              key={`fret-${index}`}
              x1={left}
              x2={gridRight}
              y1={gridTop + index * fretHeight}
              y2={gridTop + index * fretHeight}
              stroke="currentColor"
              strokeWidth={isNut ? 3 : 1}
              opacity={isNut ? 0.9 : 0.35}
            />
          );
        })}

        {Array.from({ length: STRING_COUNT }, (_, index) => (
          <line
            key={`string-${index}`}
            x1={left + index * gap}
            x2={left + index * gap}
            y1={gridTop}
            y2={gridBottom}
            stroke="currentColor"
            strokeWidth={0.8}
            opacity={0.35}
          />
        ))}

        {start > 1 && (
          <text
            x={left - 5}
            y={gridTop + fretHeight / 2 + 3}
            textAnchor="end"
            fontSize={fontSize}
            fill="currentColor"
            opacity={0.6}
          >
            {start}fr
          </text>
        )}

        {shape.frets.map((fret, index) =>
          fret === null ?
            <text
              key={`marker-${index}`}
              x={left + index * gap}
              y={markerHeight - 4}
              textAnchor="middle"
              fontSize={fontSize + 2}
              fill="currentColor"
              opacity={0.7}
            >
              ×
            </text>
          : fret === 0 ?
            <circle
              key={`marker-${index}`}
              cx={left + index * gap}
              cy={markerHeight - 6}
              r={isSmall ? 2.5 : 3}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              opacity={0.7}
            />
          : null,
        )}

        {shape.frets.map((fret, index) =>
          typeof fret === "number" && fret >= start && fret < start + count ?
            <circle
              key={`dot-${index}`}
              cx={left + index * gap}
              cy={gridTop + (fret - start) * fretHeight + fretHeight / 2}
              r={dotRadius}
              fill="currentColor"
            />
          : null,
        )}

        {interactive &&
          Array.from({ length: STRING_COUNT * count }, (_, index) => {
            const stringIndex = Math.floor(index / count);
            const row = index % count;
            const fret = start + row;
            const x = left + stringIndex * gap - gap / 2;
            return (
              <rect
                key={`cell-${stringIndex}-${row}`}
                x={x}
                y={gridTop + row * fretHeight}
                width={gap}
                height={fretHeight}
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`Cuerda ${STRING_COUNT - stringIndex}, traste ${fret}`}
                className="cursor-pointer hover:fill-white/10 focus-visible:outline-none"
                onClick={() => onToggleFret?.(stringIndex, fret)}
                onKeyDown={(event) =>
                  handleKey(event, () => onToggleFret?.(stringIndex, fret))
                }
              />
            );
          })}

        {interactive &&
          shape.frets.map((_, stringIndex) => (
            <rect
              key={`cell-marker-${stringIndex}`}
              x={left + stringIndex * gap - gap / 2}
              y={0}
              width={gap}
              height={markerHeight}
              fill="transparent"
              role="button"
              tabIndex={0}
              aria-label={`Cuerda ${STRING_COUNT - stringIndex}: al aire o muteada`}
              className="cursor-pointer hover:fill-white/10 focus-visible:outline-none"
              onClick={() => onToggleOpen?.(stringIndex)}
              onKeyDown={(event) =>
                handleKey(event, () => onToggleOpen?.(stringIndex))
              }
            />
          ))}
      </svg>
    </figure>
  );
}
