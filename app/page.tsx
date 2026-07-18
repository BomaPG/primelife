"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getProfile } from "@/lib/db/dataAccess";

/**
 * Root gate: never rendered as a destination itself. F1-AC5 — onboarding
 * only shows once; re-opening the app after that goes straight to Home.
 * Entirely local (no server data to read), so the check happens client-side
 * against Dexie before redirecting.
 */
export default function RootGate() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    getProfile().then((profile) => {
      if (cancelled) return;
      router.replace(profile?.onboardedAt ? "/home" : "/onboarding");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
