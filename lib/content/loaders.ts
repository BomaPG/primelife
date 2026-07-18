import { affirmations } from "@/content/affirmations";
import { educationArticles } from "@/content/articles";
import { mealSets } from "@/content/meals";
import { healthTopics } from "@/content/topics";
import { dailyTips } from "@/content/tips";
import type {
  Affirmation,
  DailyTip,
  EducationArticle,
  HealthTopic,
  HealthTopicId,
  MealSet,
} from "@/lib/content/types";

/**
 * Typed loaders over the static content collections in /content. Content is
 * bundled at build time (no CMS, no runtime fetch — PRD Section 9), so
 * these are synchronous lookups, not async I/O.
 */

export function getAllHealthTopics(): HealthTopic[] {
  return healthTopics;
}

export function getHealthTopicById(id: HealthTopicId): HealthTopic | undefined {
  return healthTopics.find((t) => t.id === id);
}

export function getAllEducationArticles(): EducationArticle[] {
  return educationArticles;
}

export function getEducationArticleByTopic(topicId: HealthTopicId): EducationArticle | undefined {
  return educationArticles.find((a) => a.topicId === topicId);
}

export function getAllMealSets(): MealSet[] {
  return mealSets;
}

export function getMealSetByTopic(topicId: HealthTopicId): MealSet | undefined {
  return mealSets.find((m) => m.topicId === topicId);
}

export function getAllDailyTips(): DailyTip[] {
  return dailyTips;
}

export function getAllAffirmations(): Affirmation[] {
  return affirmations;
}
