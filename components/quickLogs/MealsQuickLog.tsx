"use client";

import { useState } from "react";
import type { MealLog, MealType } from "@/lib/db/schema";

interface MealsQuickLogProps {
  mealLogs: MealLog[];
  onToggle: (mealType: MealType, done: boolean) => void;
  onNoteChange: (mealType: MealType, note: string) => void;
}

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "dinner", label: "Dinner" },
];

/** F4-AC2: mark breakfast/lunch/dinner done, each with an optional note. */
export function MealsQuickLog({ mealLogs, onToggle, onNoteChange }: MealsQuickLogProps) {
  const [expandedNote, setExpandedNote] = useState<MealType | null>(null);
  const logByType = new Map(mealLogs.map((m) => [m.mealType, m]));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium">Meals</p>
      {MEAL_TYPES.map(({ type, label }) => {
        const log = logByType.get(type);
        const done = log?.done ?? false;
        const noteOpen = expandedNote === type;
        return (
          <div key={type} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onToggle(type, !done)}
                aria-pressed={done}
                className={`min-h-11 flex-1 rounded-lg border px-4 py-2 text-left text-lg font-medium ${
                  done
                    ? "border-foreground bg-foreground text-background"
                    : "border-black/20 dark:border-white/30"
                }`}
              >
                {label} {done ? "— logged" : ""}
              </button>
              <button
                type="button"
                onClick={() => setExpandedNote(noteOpen ? null : type)}
                className="min-h-11 shrink-0 text-lg underline"
              >
                {log?.note ? "Edit note" : "Add note"}
              </button>
            </div>
            {noteOpen && (
              <input
                type="text"
                // Keyed by the stored note so this uncontrolled input picks
                // up the fresh defaultValue if the underlying log changed
                // from outside this field's own onBlur.
                key={log?.note ?? "unset"}
                defaultValue={log?.note ?? ""}
                onBlur={(e) => onNoteChange(type, e.target.value)}
                placeholder={`Note for ${label.toLowerCase()} (optional)`}
                className="min-h-11 rounded-lg border border-black/20 px-4 py-2 text-lg dark:border-white/30 dark:bg-transparent"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
