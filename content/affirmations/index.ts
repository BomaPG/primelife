import type { Affirmation } from "@/lib/content/types";

/**
 * ============================================================
 * DRAFT CONTENT — NOT YET REVIEWED. Do not treat as final.
 * ============================================================
 *
 * Rotating affirmations (PRD Section 10/16, F8-AC4). `lib/daily` picks one
 * deterministically by date (C7) — the same pick Home and Learn both show
 * for a given day. This list is also shown in full on Learn so a user can
 * browse beyond today's pick. Flagged explicitly in docs/PROJECT_STATE.md
 * as pending review.
 */
export const affirmations: Affirmation[] = [
  { id: "affirmation-01", text: "I am doing enough, just as I am today." },
  { id: "affirmation-02", text: "My body has carried me this far, and I choose to care for it gently." },
  { id: "affirmation-03", text: "Small steps every day add up to real change." },
  { id: "affirmation-04", text: "I deserve rest as much as I deserve to be busy." },
  { id: "affirmation-05", text: "I am allowed to put my own health first." },
  { id: "affirmation-06", text: "I am learning, growing, and taking care of myself — that is enough." },
  { id: "affirmation-07", text: "This stage of my life is not a decline. It is simply a new chapter." },
  { id: "affirmation-08", text: "I can ask for help, and that is a sign of strength, not weakness." },
  { id: "affirmation-09", text: "I trust myself to take things one day at a time." },
  { id: "affirmation-10", text: "I am proud of the habits I am building, one day at a time." },
];
