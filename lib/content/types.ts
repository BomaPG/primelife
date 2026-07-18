import type { ISODate } from "@/lib/db/schema";

/**
 * Static content schema per PRD Section 9. Content ships as versioned,
 * git-reviewable data under /content, statically built and precached —
 * there is no CMS and no runtime fetch for any of these shapes.
 */

export type HealthTopicId =
  | "blood-pressure"
  | "blood-sugar"
  | "menopause"
  | "heart-health"
  | "weight-management";

export interface HealthTopic {
  id: HealthTopicId;
  title: string;
  slug: string;
  summary: string; // one or two plain sentences
  hasEducation: boolean;
  hasMeals: boolean;
  relatedTopicIds?: HealthTopicId[]; // for cross-linking
}

export interface EducationArticle {
  id: string;
  topicId: HealthTopicId;
  title: string;
  slug: string;
  readingTimeMins: number;
  body: string; // markdown or MDX, plain language
  lastReviewed: ISODate;
  disclaimer: string; // rendered per C5
  sources?: string[]; // plain references
}

export type MealType = "breakfast" | "lunch" | "dinner";

export interface Meal {
  id: string;
  name: string; // familiar Nigerian meal
  whyItWorks: string; // one short line tied to the condition
}

export interface MealSet {
  id: string;
  topicId: HealthTopicId;
  title: string; // e.g. "Meals for high blood pressure"
  disclaimer: string; // rendered per C5
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
  };
}

export interface DailyTip {
  id: string;
  text: string;
  topicId?: HealthTopicId;
}

export interface Affirmation {
  id: string;
  text: string;
}
