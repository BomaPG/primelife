"use client";

import { useState } from "react";

interface WalkLogFormProps {
  onSubmit: (input: { durationMins: number; distanceKm?: number; note?: string }) => Promise<void>;
}

/** F5-AC1: required duration, optional distance and note; resets after each log so another walk can be added right away. */
export function WalkLogForm({ onSubmit }: WalkLogFormProps) {
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const durationMins = Number(duration);
  const distanceKm = distance.trim() === "" ? undefined : Number(distance);
  const distanceValid = distanceKm === undefined || (Number.isFinite(distanceKm) && distanceKm >= 0);
  const canSubmit =
    duration.trim() !== "" && Number.isFinite(durationMins) && durationMins > 0 && distanceValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    try {
      await onSubmit({
        durationMins,
        distanceKm,
        note: note.trim() === "" ? undefined : note.trim(),
      });
      setDuration("");
      setDistance("");
      setNote("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="walk-duration" className="text-lg font-medium">
          Duration (minutes)
        </label>
        <input
          id="walk-duration"
          type="number"
          inputMode="numeric"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 20"
          required
          className="min-h-11 w-32 rounded-lg border border-black/20 px-4 py-2 text-lg dark:border-white/30 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="walk-distance" className="text-lg font-medium">
          Distance (km) <span className="font-normal text-black/60 dark:text-white/60">(optional)</span>
        </label>
        <input
          id="walk-distance"
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="e.g. 1.5"
          className="min-h-11 w-32 rounded-lg border border-black/20 px-4 py-2 text-lg dark:border-white/30 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="walk-note" className="text-lg font-medium">
          Note <span className="font-normal text-black/60 dark:text-white/60">(optional)</span>
        </label>
        <input
          id="walk-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Walked around the park"
          className="min-h-11 rounded-lg border border-black/20 px-4 py-2 text-lg dark:border-white/30 dark:bg-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit || saving}
        className="min-h-11 self-start rounded-full bg-foreground px-6 py-3 text-lg font-medium text-background disabled:opacity-40"
      >
        Log walk
      </button>
    </form>
  );
}
