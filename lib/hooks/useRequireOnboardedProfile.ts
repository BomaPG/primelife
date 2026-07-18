"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/db/dataAccess";
import type { Profile } from "@/lib/db/schema";

/**
 * Shared guard for screens that require a completed onboarding (Home,
 * Settings): loads the profile, redirects to /onboarding if it's missing
 * or incomplete, and returns null while that check is in flight so the
 * caller can render nothing rather than flash stale content.
 */
export function useRequireOnboardedProfile(): Profile | null {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfile().then((p) => {
      if (cancelled) return;
      if (!p?.onboardedAt) {
        router.replace("/onboarding");
        return;
      }
      setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return profile;
}
