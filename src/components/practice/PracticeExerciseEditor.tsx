"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useI18nSection } from "@/i18n/I18nProvider";

interface PracticeExerciseEditorProps {
  exercises: string[];
  onChange: (exercises: string[]) => void;
}

export function PracticeExerciseEditor({
  exercises,
  onChange,
}: PracticeExerciseEditorProps) {
  const text = useI18nSection("practice");
  const [newExercise, setNewExercise] = useState("");

  function addExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const exercise = newExercise.trim();
    if (!exercise) return;
    onChange([...exercises, exercise]);
    setNewExercise("");
  }

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.05em] text-muted">
        {text.exercises}
      </p>
      {exercises.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {exercises.map((exercise, index) => (
            <li
              key={`${exercise}-${index}`}
              className="flex items-center gap-2 border border-line bg-canvas px-3 py-1.5 text-sm"
            >
              <span>{exercise}</span>
              <button
                type="button"
                onClick={() =>
                  onChange(
                    exercises.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                 aria-label={`${text.removeExercise} ${exercise}`}
                className="text-muted hover:text-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={addExercise} className="flex gap-2">
        <TextField
          value={newExercise}
          onChange={(event) => setNewExercise(event.target.value)}
           placeholder={text.exercisePlaceholder}
           aria-label={text.newExercise}
          className="flex-1"
        />
         <Button type="submit" aria-label={text.addExercise} size="field">
           {text.addExercise}
        </Button>
      </form>
    </div>
  );
}
