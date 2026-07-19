import type { EducationArticle } from "@/lib/content/types";

/**
 * ============================================================
 * DRAFT CONTENT — NOT YET REVIEWED. Do not treat as final.
 * ============================================================
 *
 * Drafted per PRD Section 9 (F8) as three plain-language articles at
 * roughly a lower-secondary reading level (C4): menopause and healthy
 * ageing, high blood pressure, blood sugar. Deliberately general wellness
 * framing throughout — no symptom-to-cause explanations, no diagnosis, no
 * "if you notice X it could mean Y" branching (SCOPE.md explicitly
 * excludes a Symptom Guide as a separate, out-of-scope feature). Common
 * changes are named as normal and common, never diagnosed.
 *
 * `lastReviewed` below is the date this draft was authored, not a clinical
 * review date — no health professional has checked this content yet.
 * `sources` is deliberately omitted rather than attaching citations that
 * were not actually verified against this text.
 *
 * This needs a health-content review pass before it's treated as accurate
 * or complete. Flagged explicitly in docs/PROJECT_STATE.md as pending
 * review — see that file before treating this as shipped content.
 */

const DRAFT_LAST_REVIEWED = "2026-07-19";

const DISCLAIMER =
  "This is general information, not medical advice. It does not diagnose or treat any " +
  "condition. If you feel very unwell, go to the nearest clinic or hospital.";

export const educationArticles: EducationArticle[] = [
  {
    id: "menopause-healthy-ageing",
    topicId: "menopause",
    title: "Menopause and healthy ageing",
    slug: "menopause-and-healthy-ageing",
    readingTimeMins: 4,
    lastReviewed: DRAFT_LAST_REVIEWED,
    disclaimer: DISCLAIMER,
    body: [
      "Menopause is a normal stage of life, not an illness. It happens when your body " +
        "naturally makes less of certain hormones and your monthly periods slowly stop. Most " +
        "women reach this stage between their late 40s and mid-50s, though the exact age is " +
        "different for everyone.",
      "In the years leading up to menopause, many women notice changes such as hot flushes, " +
        "changes in sleep, or shifts in mood. These changes are common and usually settle over " +
        "time. Everyone's experience is different, and there is no single \"right\" way to feel " +
        "during this time.",
      "Healthy ageing is about building simple habits that support your body and mind at every " +
        "stage of life, not only during menopause. Small, steady changes matter more than big, " +
        "short-lived ones.",
      "A few habits that help many women feel steadier during this time: staying active with " +
        "regular movement like walking, eating a varied diet with plenty of vegetables, " +
        "drinking enough water through the day, getting enough rest, and staying connected to " +
        "family and friends.",
      "You do not have to manage this alone. If any changes are worrying you, or are making " +
        "daily life hard, it is worth talking to a health worker. They can help you understand " +
        "what is happening and what support is available.",
    ].join("\n\n"),
  },
  {
    id: "understanding-high-blood-pressure",
    topicId: "blood-pressure",
    title: "Understanding high blood pressure",
    slug: "understanding-high-blood-pressure",
    readingTimeMins: 4,
    lastReviewed: DRAFT_LAST_REVIEWED,
    disclaimer: DISCLAIMER,
    body: [
      "Blood pressure is the force of blood pushing against the walls of your blood vessels as " +
        "your heart pumps. Everyone's blood pressure goes up and down through the day — that is " +
        "normal. It is called \"high\" when it stays raised over time.",
      "High blood pressure is very common, especially as we get older, and it often has no " +
        "obvious signs. The only way to know your numbers is to have your blood pressure " +
        "checked by a health worker, using a blood pressure machine.",
      "Blood pressure that stays high for a long time puts extra strain on your heart and " +
        "blood vessels. The good news is that everyday habits can make a real difference " +
        "alongside any care from a health worker.",
      "Habits that generally support healthy blood pressure: eating less salt, choosing more " +
        "vegetables, fruit, and whole foods, staying physically active most days, keeping a " +
        "healthy weight, limiting alcohol, and managing stress where you can.",
      "This app's Nourish section has meal ideas built around these habits. If you have " +
        "already been told your blood pressure is high, keep taking any medicine as your " +
        "health worker has prescribed, and go for regular check-ups — food and movement work " +
        "alongside care, not instead of it.",
    ].join("\n\n"),
  },
  {
    id: "understanding-blood-sugar",
    topicId: "blood-sugar",
    title: "Understanding blood sugar",
    slug: "understanding-blood-sugar",
    readingTimeMins: 4,
    lastReviewed: DRAFT_LAST_REVIEWED,
    disclaimer: DISCLAIMER,
    body: [
      "Blood sugar, or blood glucose, is the sugar carried in your blood that gives your body " +
        "energy. Your body naturally raises and lowers it through the day, especially around " +
        "meals — this is normal.",
      "When blood sugar stays higher than usual over a long time, it can affect how your body " +
        "feels and functions. This is why health workers check blood sugar levels from time to " +
        "time, especially as we get older.",
      "You cannot tell your blood sugar level just by how you feel, so a check with a health " +
        "worker is the only reliable way to know your numbers.",
      "Everyday habits that generally support steady blood sugar: choosing meals with fibre " +
        "and protein alongside starchy foods, eating regular meals rather than skipping them, " +
        "staying physically active, drinking water instead of sugary drinks, and getting " +
        "enough sleep.",
      "This app's Nourish section has meal ideas built around these habits. If you have " +
        "already been told your blood sugar is high, keep following the guidance from your " +
        "health worker — these habits are meant to support that care, not replace it.",
    ].join("\n\n"),
  },
];
