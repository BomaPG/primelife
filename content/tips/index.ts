import type { DailyTip } from "@/lib/content/types";

/**
 * Rotating daily-tip list (PRD Section 16 placeholder). Left empty on
 * purpose for this infrastructure scaffold; `lib/daily` selects
 * deterministically by date once this list is populated.
 */
export const dailyTips: DailyTip[] = [];
