"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MealRow } from "@/components/nourish/MealRow";
import { getEducationArticleByTopic, getMealSetByTopic } from "@/lib/content/loaders";
import { MEAL_TYPE_OPTIONS } from "@/lib/content/mealTypeOptions";
import { NOURISH_CATEGORY_OPTIONS } from "@/lib/content/nourishCategoryOptions";
import type { HealthTopicId } from "@/lib/content/types";
import { getMealLogs, todayISO, upsertMealLog } from "@/lib/db/dataAccess";
import type { MealLog, MealType } from "@/lib/db/schema";
import { useRequireOnboardedProfile } from "@/lib/hooks/useRequireOnboardedProfile";
import { useScrollToHash } from "@/lib/hooks/useScrollToHash";

// F7 doesn't have its own cross-link field (that's HealthTopic.relatedTopicIds,
// PRD Section 9 — a separate content collection this step doesn't touch), so
// the "cross-link to each other" ask is realized directly here as an in-page
// anchor between the only two categories that also have education content.
const CROSS_LINKED_TOPIC: Partial<Record<HealthTopicId, HealthTopicId>> = {
  "blood-pressure": "blood-sugar",
  "blood-sugar": "blood-pressure",
};

/**
 * F7: recommended meals for the four health categories, no recipes/
 * ingredients/cooking steps (SCOPE.md) — a `Meal` is a name plus one
 * "why this works" line. Meal content comes from the static, build-time
 * `getMealSetByTopic` loader (F7-AC5: no network call, ever); this page
 * only reads today's `mealLogs` to know which meals are already attached.
 */
export default function NourishPage() {
  const profile = useRequireOnboardedProfile();
  const [today] = useState(() => todayISO());
  const [mealLogs, setMealLogs] = useState<MealLog[] | null>(null);

  const reload = useCallback(async () => {
    setMealLogs(await getMealLogs(today));
  }, [today]);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [profile, reload]);

  // Learn's "See meal ideas" link (F8-AC3) points here as `/nourish#topicId`.
  useScrollToHash(!!profile && !!mealLogs);

  if (!profile || !mealLogs) {
    return null;
  }

  async function handleAttach(mealType: MealType, mealId: string) {
    const existing = mealLogs?.find((m) => m.mealType === mealType);
    await upsertMealLog({
      date: today,
      mealType,
      done: existing?.done ?? false,
      recommendedMealId: mealId,
    });
    await reload();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">Nourish</h1>
        <Link href="/home" className="min-h-11 shrink-0 text-lg font-medium underline">
          Back to Home
        </Link>
      </div>

      {/* F7-AC4: persistent disclaimer, independent of whether any category
          has content yet — this is the one always-rendered "screen" here. */}
      <div className="rounded-lg border border-black/20 p-4 text-lg dark:border-white/30">
        <p className="font-medium">Not medical advice</p>
        <p className="text-black/70 dark:text-white/70">
          These are general meal ideas, not a treatment plan. Talk to a health worker about
          what&apos;s right for you.
        </p>
      </div>

      {NOURISH_CATEGORY_OPTIONS.map(({ id: topicId, label }) => {
        const mealSet = getMealSetByTopic(topicId);
        const article = getEducationArticleByTopic(topicId);
        const relatedTopicId = CROSS_LINKED_TOPIC[topicId];
        const relatedLabel = relatedTopicId
          ? NOURISH_CATEGORY_OPTIONS.find((c) => c.id === relatedTopicId)?.label
          : undefined;

        return (
          <section key={topicId} id={topicId} className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">{label}</h2>

            {!mealSet ? (
              <p className="text-lg text-black/70 dark:text-white/70">
                Meal ideas for {label.toLowerCase()} are coming soon.
              </p>
            ) : (
              <>
                <p className="text-lg text-black/70 dark:text-white/70">{mealSet.disclaimer}</p>
                {MEAL_TYPE_OPTIONS.map(({ type, label: mealTypeLabel }) => (
                  <div key={type} className="flex flex-col gap-2">
                    <p className="text-lg font-medium">{mealTypeLabel}</p>
                    <ul className="flex flex-col gap-2">
                      {mealSet.meals[type].map((meal) => (
                        <MealRow
                          key={meal.id}
                          meal={meal}
                          mealTypeLabel={mealTypeLabel}
                          attached={
                            mealLogs.find((m) => m.mealType === type)?.recommendedMealId === meal.id
                          }
                          onAttach={() => handleAttach(type, meal.id)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}

            {(relatedLabel || article) && (
              <div className="flex flex-col gap-1">
                {relatedLabel && (
                  <a
                    href={`#${relatedTopicId}`}
                    className="flex min-h-11 items-center text-lg font-medium underline"
                  >
                    See also: {relatedLabel} meals
                  </a>
                )}
                {article && (
                  <Link
                    href={`/learn#${article.slug}`}
                    className="flex min-h-11 items-center text-lg font-medium underline"
                  >
                    Read: {article.title}
                  </Link>
                )}
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}
