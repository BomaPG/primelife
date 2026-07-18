import type { SleepLog, SleepQuality } from "@/lib/db/schema";

interface SleepQuickLogProps {
  sleepLog?: SleepLog;
  onChangeHours: (hours: number) => void;
  onChangeQuality: (quality: SleepQuality) => void;
}

const QUALITY_OPTIONS: { value: SleepQuality; label: string }[] = [
  { value: "good", label: "Good" },
  { value: "okay", label: "Okay" },
  { value: "poor", label: "Poor" },
];

/**
 * F4-AC3: optional hours + quality. Writes through the same
 * `upsertSleepLog` the Daily Check-In uses for quality — both key off the
 * same `date` primary key in the sleepLogs table, so there is structurally
 * no way to end up with two rows for one day.
 */
export function SleepQuickLog({ sleepLog, onChangeHours, onChangeQuality }: SleepQuickLogProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-medium">Sleep</p>
      <div className="flex items-center gap-3">
        <label htmlFor="sleep-hours" className="text-lg">
          Hours
        </label>
        <input
          id="sleep-hours"
          // Keyed by the stored value so this uncontrolled input remounts
          // (picking up the fresh defaultValue) whenever hours changes from
          // outside this field's own onBlur — e.g. after a reload triggered
          // by the Daily Check-In or another quick-log write.
          key={sleepLog?.hours ?? "unset"}
          type="number"
          inputMode="decimal"
          min={0}
          max={24}
          step={0.5}
          defaultValue={sleepLog?.hours ?? ""}
          onBlur={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= 0) onChangeHours(n);
          }}
          className="min-h-11 w-24 rounded-lg border border-black/20 px-4 py-2 text-lg dark:border-white/30 dark:bg-transparent"
        />
      </div>
      <div className="flex gap-3">
        {QUALITY_OPTIONS.map((option) => {
          const selected = sleepLog?.quality === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeQuality(option.value)}
              aria-pressed={selected}
              className={`min-h-11 flex-1 rounded-lg border px-4 py-2 text-lg font-medium ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-black/20 dark:border-white/30"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
