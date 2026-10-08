"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";

const AVAILABLE_MINUTES = [15, 30, 45, 60];

export function SuggestedPractice() {
  const [durationMinutes, setDurationMinutes] = useState(30);

  return (
    <section
      className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:flex sm:items-center sm:justify-between sm:gap-10 sm:p-8"
      style={{ "--index": 2 } as CSSProperties}
    >
      <div className="max-w-lg">
        <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
          Acceso directo
        </p>
        <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
          ¿Cuánto tiempo tienes hoy?
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Preparamos una sesión breve de técnica y repertorio según tu tiempo.
        </p>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Tiempo disponible">
          {AVAILABLE_MINUTES.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => setDurationMinutes(minutes)}
              aria-pressed={durationMinutes === minutes}
              className={`min-w-16 rounded-md border px-4 py-2.5 text-sm font-mono transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 ${
                durationMinutes === minutes
                  ? "border-zinc-200 bg-zinc-200 text-zinc-950"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {minutes}{" "}
              <span className="ml-1 font-sans text-xs">min</span>
            </button>
          ))}
        </div>
      </div>

      <Link
        href={`/practice?minutes=${durationMinutes}`}
        className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-md bg-zinc-100 px-6 text-sm font-semibold text-zinc-950 transition hover:bg-white active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 sm:mt-0 sm:w-auto sm:min-w-64"
      >
        Iniciar práctica sugerida
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
          <path
            d="M4 10h11m-4-4 4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </section>
  );
}
