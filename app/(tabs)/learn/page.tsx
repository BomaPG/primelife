"use client";

import Link from "next/link";
import { useState } from "react";
import { ArticleSection } from "@/components/learn/ArticleSection";
import { getTodaysContent } from "@/lib/daily/dailyContent";
import { getAllAffirmations, getAllDailyTips, getAllEducationArticles } from "@/lib/content/loaders";
import { todayISO } from "@/lib/db/dataAccess";
import { useRequireOnboardedProfile } from "@/lib/hooks/useRequireOnboardedProfile";
import { useScrollToHash } from "@/lib/hooks/useScrollToHash";

/**
 * F8: the fifth and final tab — education articles plus the daily
 * wellbeing content (Thrive). Like Nourish, all content is bundled at
 * build time from /content — no fetch anywhere on this page (F8-AC5).
 */
export default function LearnPage() {
  const profile = useRequireOnboardedProfile();
  const [today] = useState(() => todayISO());

  // Nourish's "Read: ..." link (F7-AC3) points here as `/learn#slug`.
  useScrollToHash(!!profile);

  if (!profile) {
    return null;
  }

  const articles = getAllEducationArticles();
  const tips = getAllDailyTips();
  const affirmations = getAllAffirmations();
  // F8-AC4: the same deterministic-by-date pick Home uses, so "today's tip"
  // and "today's affirmation" here always agree with Home for the same day.
  const { tip, affirmation } = getTodaysContent(today);
  const otherTips = tip ? tips.filter((t) => t.id !== tip.id) : tips;
  const otherAffirmations = affirmation
    ? affirmations.filter((a) => a.id !== affirmation.id)
    : affirmations;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">Learn</h1>
        <Link href="/home" className="min-h-11 shrink-0 text-lg font-medium underline">
          Back to Home
        </Link>
      </div>

      {/* C5: persistent disclaimer, independent of whether article content
          exists yet — same pattern as Nourish's top-of-page disclaimer. */}
      <div className="rounded-lg border border-black/20 p-4 text-lg dark:border-white/30">
        <p className="font-medium">Not medical advice</p>
        <p className="text-black/70 dark:text-white/70">
          These articles are general education, not a diagnosis or treatment plan. If you feel
          very unwell, go to the nearest clinic or hospital.
        </p>
      </div>

      <section className="flex flex-col gap-10">
        {articles.length === 0 ? (
          <p className="text-lg text-black/70 dark:text-white/70">Articles are coming soon.</p>
        ) : (
          articles.map((article) => <ArticleSection key={article.id} article={article} />)
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Wellness tips</h2>
        {tips.length === 0 ? (
          <p className="text-lg text-black/70 dark:text-white/70">Tips are coming soon.</p>
        ) : (
          <>
            {tip && (
              <p className="text-lg">
                <span className="font-medium">Today: </span>
                {tip.text}
              </p>
            )}
            {otherTips.length > 0 && (
              <ul className="flex flex-col gap-2">
                {otherTips.map((t) => (
                  <li key={t.id} className="text-lg text-black/70 dark:text-white/70">
                    {t.text}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Affirmations</h2>
        {affirmations.length === 0 ? (
          <p className="text-lg text-black/70 dark:text-white/70">Affirmations are coming soon.</p>
        ) : (
          <>
            {affirmation && (
              <div className="rounded-lg border border-black/20 p-4 text-lg italic dark:border-white/30">
                {affirmation.text}
              </div>
            )}
            {otherAffirmations.length > 0 && (
              <ul className="flex flex-col gap-2">
                {otherAffirmations.map((a) => (
                  <li key={a.id} className="text-lg text-black/70 dark:text-white/70">
                    {a.text}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}
