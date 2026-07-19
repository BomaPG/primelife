import type { MealSet } from "@/lib/content/types";

/**
 * ============================================================
 * DRAFT CONTENT — NOT YET REVIEWED. Do not treat as final.
 * ============================================================
 *
 * Drafted per PRD Section 9 as familiar Nigerian meals with a one-line
 * "why this works" tied to broadly-agreed dietary principles for each
 * condition (DASH-style lower-sodium/higher-potassium eating for blood
 * pressure; lower-glycaemic-impact, higher-fibre pairings for blood sugar;
 * lower-saturated-fat, higher-unsaturated-fat/fibre choices for heart
 * health; higher-protein/fibre choices for satiety for weight management —
 * deliberately no calorie or macro figures, per SCOPE.md). No ingredients,
 * quantities, or cooking steps anywhere — a `Meal` is a name plus one
 * reason, per SCOPE.md's "no recipes" constraint.
 *
 * This needs a clinical/nutrition review pass before it's treated as
 * accurate or complete: portion guidance is intentionally generic (e.g.
 * "swallow" rather than naming a specific lower-glycaemic option), and a
 * reviewer may want to adjust specific dish choices, add more variety, or
 * tighten wording. Flagged explicitly in docs/PROJECT_STATE.md as pending
 * review — see that file before treating this as shipped content.
 */
export const mealSets: MealSet[] = [
  {
    id: "blood-pressure",
    topicId: "blood-pressure",
    title: "Meals for high blood pressure",
    disclaimer:
      "General meal ideas, not a treatment plan — check with a health worker about what's right for you.",
    meals: {
      breakfast: [
        {
          id: "bp-b1",
          name: "Oats with fresh fruit",
          whyItWorks: "Oats are naturally low in sodium and high in fibre, both linked to healthier blood pressure.",
        },
        {
          id: "bp-b2",
          name: "Akara and pap",
          whyItWorks: "Beans are a plant protein and potassium source, and this combo is naturally light on added salt.",
        },
        {
          id: "bp-b3",
          name: "Yam and vegetable sauce",
          whyItWorks: "Yam is low in sodium on its own, and leafy vegetables add potassium that helps balance sodium's effect.",
        },
      ],
      lunch: [
        {
          id: "bp-l1",
          name: "Unripe plantain and vegetable soup",
          whyItWorks: "Unripe plantain and leafy vegetables together bring fibre and potassium, both supportive of healthy blood pressure.",
        },
        {
          id: "bp-l2",
          name: "Beans porridge (ewa)",
          whyItWorks: "Beans are rich in fibre and potassium and naturally low in sodium.",
        },
        {
          id: "bp-l3",
          name: "Vegetable salad with grilled fish",
          whyItWorks: "A fresh, plant-forward plate with lean fish keeps a meal lighter on sodium.",
        },
      ],
      dinner: [
        {
          id: "bp-d1",
          name: "Fish pepper soup",
          whyItWorks: "A broth-based dish built around fish tends to be lighter on added salt than heavier fried options.",
        },
        {
          id: "bp-d2",
          name: "Okra soup and swallow",
          whyItWorks: "Okra is low in sodium and adds fibre, especially when paired with a modest portion of swallow.",
        },
        {
          id: "bp-d3",
          name: "Ukwa (breadfruit porridge)",
          whyItWorks: "Breadfruit is a good source of potassium and fibre, nutrients associated with healthier blood pressure.",
        },
      ],
    },
  },
  {
    id: "blood-sugar",
    topicId: "blood-sugar",
    title: "Meals for blood sugar",
    disclaimer:
      "General meal ideas, not a treatment plan — check with a health worker about what's right for you.",
    meals: {
      breakfast: [
        {
          id: "bs-b1",
          name: "Moi moi",
          whyItWorks: "Made mostly from beans, moi moi is high in protein and fibre, which slows down how quickly sugar enters the blood.",
        },
        {
          id: "bs-b2",
          name: "Ogi (unsweetened)",
          whyItWorks: "A whole-grain pap without added sugar has a gentler effect on blood sugar than sweetened cereals.",
        },
        {
          id: "bs-b3",
          name: "Boiled eggs with vegetables",
          whyItWorks: "Protein and vegetables together tend to raise blood sugar more slowly than starchy food alone.",
        },
      ],
      lunch: [
        {
          id: "bs-l1",
          name: "Beans and corn (adalu)",
          whyItWorks: "Combining beans and corn brings fibre and protein that help steady a rise in blood sugar.",
        },
        {
          id: "bs-l2",
          name: "Unripe plantain porridge",
          whyItWorks: "Unripe plantain has a lower glycaemic impact than very ripe plantain or white rice.",
        },
        {
          id: "bs-l3",
          name: "Vegetable soup and swallow",
          whyItWorks: "Pairing a modest starch portion with plenty of vegetables helps moderate a meal's effect on blood sugar.",
        },
      ],
      dinner: [
        {
          id: "bs-d1",
          name: "Grilled fish with vegetable salad",
          whyItWorks: "Lean protein and vegetables with little refined starch are gentler on blood sugar in the evening.",
        },
        {
          id: "bs-d2",
          name: "Egusi soup and swallow",
          whyItWorks: "A protein-rich soup with a modest starch portion helps balance a meal's overall glycaemic effect.",
        },
        {
          id: "bs-d3",
          name: "Peppered chicken with sautéed vegetables",
          whyItWorks: "Protein and vegetables without refined carbohydrates support steadier blood sugar overnight.",
        },
      ],
    },
  },
  {
    id: "heart-health",
    topicId: "heart-health",
    title: "Meals for heart health",
    disclaimer:
      "General meal ideas, not a treatment plan — check with a health worker about what's right for you.",
    meals: {
      breakfast: [
        {
          id: "hh-b1",
          name: "Oats with fresh fruit",
          whyItWorks: "Oats' soluble fibre is linked to healthier cholesterol levels, which supports heart health.",
        },
        {
          id: "hh-b2",
          name: "Akara and pap",
          whyItWorks: "Beans are a plant protein that fits well into a heart-healthy eating pattern.",
        },
        {
          id: "hh-b3",
          name: "Boiled plantain with egg",
          whyItWorks: "A lighter breakfast pairing gives lasting energy without leaning on saturated fat.",
        },
      ],
      lunch: [
        {
          id: "hh-l1",
          name: "Grilled fish with vegetables",
          whyItWorks: "Fish brings unsaturated fats, a heart-healthier choice than fried, fatty meats.",
        },
        {
          id: "hh-l2",
          name: "Vegetable soup (efo riro)",
          whyItWorks: "Leafy greens add fibre and nutrients that support heart health.",
        },
        {
          id: "hh-l3",
          name: "Beans porridge (ewa)",
          whyItWorks: "Beans are naturally low in saturated fat and rich in fibre, both good for the heart.",
        },
      ],
      dinner: [
        {
          id: "hh-d1",
          name: "Fish pepper soup",
          whyItWorks: "A lighter, broth-based dish is a heart-friendlier choice than heavy fried food.",
        },
        {
          id: "hh-d2",
          name: "Okra soup and swallow",
          whyItWorks: "Okra is low in saturated fat and adds fibre to a modest, balanced meal.",
        },
        {
          id: "hh-d3",
          name: "Vegetable salad",
          whyItWorks: "A fresh, plant-forward plate supports a heart-healthy pattern of eating.",
        },
      ],
    },
  },
  {
    id: "weight-management",
    topicId: "weight-management",
    title: "Meals for weight management",
    disclaimer:
      "General meal ideas, not a treatment plan — check with a health worker about what's right for you.",
    meals: {
      breakfast: [
        {
          id: "wm-b1",
          name: "Boiled eggs with vegetables",
          whyItWorks: "Protein and vegetables together can help you feel fuller for longer on a modest portion.",
        },
        {
          id: "wm-b2",
          name: "Oats with fresh fruit",
          whyItWorks: "Fibre-rich oats digest slowly, which can help manage hunger through the morning.",
        },
        {
          id: "wm-b3",
          name: "Akara and pap",
          whyItWorks: "A modest portion of beans and pap gives protein and steady energy without being heavy.",
        },
      ],
      lunch: [
        {
          id: "wm-l1",
          name: "Vegetable soup and swallow",
          whyItWorks: "Filling up on vegetables alongside a modest starch portion supports mindful portions.",
        },
        {
          id: "wm-l2",
          name: "Grilled fish with vegetable salad",
          whyItWorks: "Lean protein and vegetables are filling without leaning on refined starch.",
        },
        {
          id: "wm-l3",
          name: "Beans and unripe plantain",
          whyItWorks: "Fibre-rich beans and lower-glycaemic plantain together support fullness on a modest portion.",
        },
      ],
      dinner: [
        {
          id: "wm-d1",
          name: "Peppered chicken with sautéed vegetables",
          whyItWorks: "A protein-and-vegetable plate keeps dinner satisfying without excess starch.",
        },
        {
          id: "wm-d2",
          name: "Vegetable salad with boiled egg",
          whyItWorks: "A lighter, protein-and-fibre dinner supports a mindful eating pattern.",
        },
        {
          id: "wm-d3",
          name: "Okra soup and swallow",
          whyItWorks: "A modest starch portion alongside a vegetable-rich soup supports portion awareness.",
        },
      ],
    },
  },
];
