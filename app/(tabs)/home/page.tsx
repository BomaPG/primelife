"use client";

import Link from "next/link";
import { useRequireOnboardedProfile } from "@/lib/hooks/useRequireOnboardedProfile";

/**
 * Minimal Home placeholder. Satisfies F1-AC1 ("reaches a usable Home") for
 * this step — the full dashboard (tip, goals, quick logs, weekly summary,
 * affirmation) is F3, built in Step 3.
 */
export default function HomePage() {
  const profile = useRequireOnboardedProfile();

  if (!profile) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">
          {profile.name ? `Welcome back, ${profile.name}` : "Welcome back"}
        </h1>
        <Link href="/settings" className="min-h-11 shrink-0 text-lg font-medium underline">
          Settings
        </Link>
      </div>
      <p className="text-lg text-black/70 dark:text-white/70">
        Your daily check-in, goals, and progress are coming here next. For now, your
        preferences are saved and ready to edit anytime in Settings.
      </p>
    </main>
  );
}
