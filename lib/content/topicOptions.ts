import type { HealthTopicId } from "@/lib/content/types";

/**
 * Display labels for the five health topics, used by the onboarding and
 * settings "interested topics" picker. Kept separate from
 * `content/topics/index.ts` (the full `HealthTopic` content collection,
 * still empty pending content authoring) — a picker label is UI copy, not
 * the topic's full content record.
 */
export const HEALTH_TOPIC_OPTIONS: { id: HealthTopicId; label: string }[] = [
  { id: "blood-pressure", label: "Blood pressure" },
  { id: "blood-sugar", label: "Blood sugar" },
  { id: "menopause", label: "Menopause & healthy ageing" },
  { id: "heart-health", label: "Heart health" },
  { id: "weight-management", label: "Weight management" },
];
