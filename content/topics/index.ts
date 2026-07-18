import type { HealthTopic } from "@/lib/content/types";

/**
 * PRD Section 9 requires five topics: blood-pressure, blood-sugar,
 * menopause, heart-health, weight-management. Bodies/instances are a
 * content-authoring step (PRD Section 16 placeholders), not part of this
 * infrastructure scaffold — left empty on purpose.
 */
export const healthTopics: HealthTopic[] = [];
