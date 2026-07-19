import Link from "next/link";
import { getMealSetByTopic } from "@/lib/content/loaders";
import type { EducationArticle } from "@/lib/content/types";
import { parseISODateUTC } from "@/lib/dates";

interface ArticleSectionProps {
  article: EducationArticle;
}

/** "2026-07-19" -> "July 19, 2026". */
function formatReviewedDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(parseISODateUTC(date));
}

/**
 * F8-AC2/AC3: one education article — body, last-reviewed date, disclaimer
 * (C5), and (only when a matching `MealSet` exists — blood-pressure and
 * blood-sugar per PRD Section 9's cross-linking rule) a link to it.
 * `article.body` is plain text with blank-line-separated paragraphs, not
 * markdown — no markdown dependency exists in this codebase yet.
 */
export function ArticleSection({ article }: ArticleSectionProps) {
  const mealSet = getMealSetByTopic(article.topicId);
  const paragraphs = article.body.split("\n\n").filter((p) => p.trim().length > 0);

  return (
    <section id={article.slug} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">{article.title}</h2>
        <p className="text-lg text-black/70 dark:text-white/70">
          {article.readingTimeMins} min read · Last reviewed {formatReviewedDate(article.lastReviewed)}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="text-lg">
            {paragraph}
          </p>
        ))}
      </div>

      <p className="text-lg text-black/70 dark:text-white/70">{article.disclaimer}</p>

      {mealSet && (
        <Link
          href={`/nourish#${article.topicId}`}
          className="flex min-h-11 items-center self-start text-lg font-medium underline"
        >
          See meal ideas: {mealSet.title}
        </Link>
      )}
    </section>
  );
}
