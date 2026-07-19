import type { HealthTopicId } from "@/lib/content/types";

/**
 * The four Nourish categories (`F7-AC1`), in display order. `menopause` is
 * deliberately excluded — PRD Section 9's cross-linking rule sets
 * `hasMeals: false` for it, so it never gets a `MealSet`.
 */
export const NOURISH_CATEGORY_OPTIONS: { id: HealthTopicId; label: string }[] = [
  { id: "blood-pressure", label: "High blood pressure" },
  { id: "blood-sugar", label: "Blood sugar" },
  { id: "heart-health", label: "Heart health" },
  { id: "weight-management", label: "Weight management" },
];
