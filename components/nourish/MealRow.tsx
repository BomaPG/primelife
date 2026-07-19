import type { Meal } from "@/lib/content/types";

interface MealRowProps {
  meal: Meal;
  mealTypeLabel: string; // e.g. "Breakfast" — used only for the button's label
  attached: boolean;
  onAttach: () => void;
}

/** F7-AC2/AC6: a single recommended meal, with an action to attach it to today's meal log. */
export function MealRow({ meal, mealTypeLabel, attached, onAttach }: MealRowProps) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-black/20 p-4 dark:border-white/30">
      <p className="text-lg font-medium">{meal.name}</p>
      <p className="text-lg text-black/70 dark:text-white/70">{meal.whyItWorks}</p>
      <button
        type="button"
        onClick={onAttach}
        disabled={attached}
        aria-label={`Add ${meal.name} to today's ${mealTypeLabel.toLowerCase()}`}
        className="min-h-11 self-start rounded-full border border-black/20 px-5 py-2 text-lg font-medium disabled:opacity-60 dark:border-white/30"
      >
        {attached ? "Added to today's log ✓" : `Add to today's ${mealTypeLabel.toLowerCase()}`}
      </button>
    </li>
  );
}
