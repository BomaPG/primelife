"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PreferencesFields, type PreferencesValue } from "@/components/PreferencesFields";
import { clearAllLocalData, updateProfile } from "@/lib/db/dataAccess";
import type { Profile } from "@/lib/db/schema";
import { useRequireOnboardedProfile } from "@/lib/hooks/useRequireOnboardedProfile";

/**
 * Settings (F11): edit the same preferences captured at onboarding
 * (F11-AC1), plus "clear my data" (F11-AC2) and the on-device-only data
 * statement (F11-AC3).
 */
export default function SettingsPage() {
  const profile = useRequireOnboardedProfile();

  // Mounted only once `profile` resolves, so its local editable state can
  // be seeded directly from a lazy useState initializer instead of syncing
  // via an effect (which would trigger a redundant extra render).
  if (!profile) {
    return null;
  }
  return <SettingsForm profile={profile} />;
}

function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<PreferencesValue>(() => ({
    name: profile.name ?? "",
    waterTargetGlasses: profile.waterTargetGlasses,
    remindersEnabled: profile.remindersEnabled,
    interestedTopics: profile.interestedTopics,
  }));
  const [saved, setSaved] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  function updatePreferences(patch: Partial<PreferencesValue>) {
    setPreferences((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile({
      name: preferences.name.trim() || undefined,
      waterTargetGlasses: preferences.waterTargetGlasses,
      remindersEnabled: preferences.remindersEnabled,
      interestedTopics: preferences.interestedTopics,
    });
    setSaved(true);
  }

  async function handleConfirmClear() {
    setClearing(true);
    await clearAllLocalData();
    router.replace("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <Link href="/home" className="min-h-11 shrink-0 text-lg font-medium underline">
          Back to Home
        </Link>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        <PreferencesFields value={preferences} onChange={updatePreferences} />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="min-h-11 rounded-full bg-foreground px-6 py-3 text-lg font-medium text-background"
          >
            Save changes
          </button>
          <p aria-live="polite" className="text-lg text-black/70 dark:text-white/70">
            {saved ? "Saved." : ""}
          </p>
        </div>
      </form>

      <div className="flex flex-col gap-4 rounded-lg border border-black/20 p-4 dark:border-white/30">
        <p className="text-lg font-medium">Your data</p>
        <p className="text-lg text-black/70 dark:text-white/70">
          Everything you enter in PrimeLife lives only on this device. There is no account and
          nothing is sent anywhere in this version of the app.
        </p>

        {!confirmingClear ? (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="min-h-11 self-start rounded-full border border-red-600 px-6 py-3 text-lg font-medium text-red-600"
          >
            Clear my data
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-red-600 p-4">
            <p className="text-lg font-medium">
              This deletes everything you&apos;ve entered on this device and cannot be undone.
              Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={clearing}
                className="min-h-11 rounded-full bg-red-600 px-6 py-3 text-lg font-medium text-white disabled:opacity-60"
              >
                Yes, delete everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                disabled={clearing}
                className="min-h-11 rounded-full border border-black/20 px-6 py-3 text-lg font-medium dark:border-white/30"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
