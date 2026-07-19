import type { MealType } from "@/lib/db/schema";

/**
 * Display labels for the three daily meal slots, shared by the Home
 * quick-log (`MealsQuickLog`) and the Track daily-logs view so the wording
 * can't drift between the two places a day's meals are rendered.
 */
export const MEAL_TYPE_OPTIONS: { type: MealType; label: string }[] = [
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "dinner", label: "Dinner" },
];
