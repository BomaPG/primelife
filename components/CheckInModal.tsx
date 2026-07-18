"use client";

import { useEffect, useState } from "react";
import { completeCheckIn } from "@/lib/db/dataAccess";
import type { Feeling, SleepQuality } from "@/lib/db/schema";

interface CheckInModalProps {
  date: string;
  onComplete: () => void;
  onDismiss: () => void;
}

type Answers = {
  sleepQuality?: SleepQuality;
  feeling?: Feeling;
  movedYesterday?: boolean;
};

const STEPS: {
  key: keyof Answers;
  question: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "sleepQuality",
    question: "How did you sleep?",
    options: [
      { value: "good", label: "Good" },
      { value: "okay", label: "Okay" },
      { value: "poor", label: "Poor" },
    ],
  },
  {
    key: "feeling",
    question: "How are you feeling today?",
    options: [
      { value: "great", label: "Great" },
      { value: "okay", label: "Okay" },
      { value: "low", label: "Low" },
    ],
  },
  {
    key: "movedYesterday",
    question: "Did you move yesterday?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

/**
 * F2: three questions, one tap each. Tapping an answer immediately advances
 * to the next question and auto-submits after the third — no separate
 * "submit" tap, so completing the whole flow is exactly three taps
 * (F2-AC5). Dismissing (the close button) is a separate action, not part
 * of that budget.
 */
export function CheckInModal({ date, onComplete, onDismiss }: CheckInModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  async function selectAnswer(rawValue: string) {
    const current = STEPS[step];
    const value = current.key === "movedYesterday" ? rawValue === "yes" : rawValue;
    const nextAnswers: Answers = { ...answers, [current.key]: value };
    setAnswers(nextAnswers);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    // Last question answered — auto-submit, no extra tap.
    setSubmitting(true);
    await completeCheckIn({
      date,
      sleepQuality: nextAnswers.sleepQuality!,
      feeling: nextAnswers.feeling!,
      movedYesterday: nextAnswers.movedYesterday!,
    });
    onComplete();
  }

  const current = STEPS[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-question"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="flex w-full max-w-md flex-col gap-6 rounded-t-2xl bg-background p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg text-black/60 dark:text-white/60">
            Question {step + 1} of {STEPS.length}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close check-in"
            className="flex min-h-11 min-w-11 items-center justify-center text-2xl"
          >
            &times;
          </button>
        </div>

        <h2 id="checkin-question" className="text-2xl font-semibold">
          {current.question}
        </h2>

        {/* Keyed by step so autoFocus re-applies to the first option of each
            new question instead of only firing once on initial mount. */}
        <div key={step} className="flex flex-col gap-3">
          {current.options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              autoFocus={index === 0}
              disabled={submitting}
              onClick={() => selectAnswer(option.value)}
              className="min-h-11 rounded-lg border border-black/20 px-5 py-3 text-left text-lg font-medium disabled:opacity-50 dark:border-white/30"
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          disabled={submitting}
          className="min-h-11 self-center text-lg text-black/60 underline disabled:opacity-50 dark:text-white/60"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
