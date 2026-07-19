"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PreferencesFields, type PreferencesValue } from "@/components/PreferencesFields";
import { acceptDisclaimer, createProfile, markOnboarded } from "@/lib/db/dataAccess";

const DEFAULT_PREFERENCES: PreferencesValue = {
  name: "",
  waterTargetGlasses: 8,
  remindersEnabled: false,
  interestedTopics: [],
};

/**
 * First-run onboarding (F1). A single screen, not a multi-step wizard, so
 * completing it is one tap on "Get started" (plus the disclaimer
 * checkbox) — keeps F1-AC1's "usable Home within three taps" budget wide
 * open. No account, no network request (F1-AC4): everything here is a
 * local Dexie write via the data-access layer.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<PreferencesValue>(DEFAULT_PREFERENCES);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updatePreferences(patch: Partial<PreferencesValue>) {
    setPreferences((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!disclaimerAccepted || submitting) return;
    setSubmitting(true);

    // F1-AC2: name/water target/reminders/topics captured here, all
    // editable later in Settings. F1-AC3: disclaimer acknowledgement
    // timestamp stored in profile.disclaimerAcceptedAt.
    await createProfile({
      name: preferences.name.trim() || undefined,
      waterTargetGlasses: preferences.waterTargetGlasses,
      remindersEnabled: preferences.remindersEnabled,
      interestedTopics: preferences.interestedTopics,
    });
    await acceptDisclaimer();
    await markOnboarded();

    router.replace("/home");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Welcome to PrimeLife</h1>
        <p className="text-lg text-black/70 dark:text-white/70">
          A few quick preferences, then you&apos;re in. Nothing here requires an account, and
          everything stays on this device.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <PreferencesFields value={preferences} onChange={updatePreferences} />

        <div className="flex flex-col gap-3 rounded-lg border border-black/20 p-4 dark:border-white/30">
          <p className="text-lg font-medium">Before you start</p>
          <p className="text-lg text-black/70 dark:text-white/70">
            PrimeLife offers general wellness guidance and habit tracking. It is not medical
            advice and does not diagnose or treat any condition. If you feel very unwell, go to
            the nearest clinic or hospital.
          </p>
          {/* C4: see the matching comment in PreferencesFields.tsx — a bare
              checkbox plus its label text are each individually under the
              44px tap-target floor, so this wraps both in one <label> to
              make the whole row a single ≥44px clickable target. */}
          <label
            htmlFor="disclaimer-accept"
            className="flex min-h-11 cursor-pointer items-center gap-3 text-lg"
          >
            <input
              id="disclaimer-accept"
              type="checkbox"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              className="h-6 w-6 shrink-0"
              required
            />
            I understand this is general guidance, not medical advice.
          </label>
        </div>

        <button
          type="submit"
          disabled={!disclaimerAccepted || submitting}
          className="min-h-11 rounded-full bg-foreground px-6 py-3 text-lg font-medium text-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          Get started
        </button>
      </form>
    </main>
  );
}
