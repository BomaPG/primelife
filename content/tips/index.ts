import type { DailyTip } from "@/lib/content/types";

/**
 * ============================================================
 * DRAFT CONTENT — NOT YET REVIEWED. Do not treat as final.
 * ============================================================
 *
 * Rotating daily wellness tips (PRD Section 10/16, F8-AC4). General,
 * non-diagnostic habit nudges only — no medical claims, no symptom-to-cause
 * framing. `lib/daily` picks one deterministically by date (C7); this list
 * is also shown in full on Learn so a user can browse beyond today's pick.
 * Flagged explicitly in docs/PROJECT_STATE.md as pending review.
 */
export const dailyTips: DailyTip[] = [
  { id: "tip-01", text: "Start your day with a glass of water — an easy way to build up your daily total." },
  { id: "tip-02", text: "A short walk after a meal, even five minutes, can help you feel more comfortable." },
  { id: "tip-03", text: "Choose the stairs instead of the lift today, if you're able to — every bit of movement counts." },
  { id: "tip-04", text: "Add one extra vegetable to your plate at your next meal." },
  { id: "tip-05", text: "Try switching off screens an hour before bed tonight — it can help you settle into sleep." },
  { id: "tip-06", text: "Take a few slow, deep breaths when you feel stretched — a simple way to ease stress." },
  { id: "tip-07", text: "Swap a sugary drink for water or unsweetened tea today." },
  { id: "tip-08", text: "Call or visit someone you care about — staying connected is good for your wellbeing too." },
  { id: "tip-09", text: "Rest when you need to. Rest is part of taking care of yourself, not a sign of weakness." },
  { id: "tip-10", text: "Keep a consistent bedtime this week — your body settles into a rhythm it can rely on." },
];
