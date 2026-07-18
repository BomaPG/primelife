import { HEALTH_TOPIC_OPTIONS } from "@/lib/content/topicOptions";
import type { HealthTopicId } from "@/lib/content/types";

export interface PreferencesValue {
  name: string;
  waterTargetGlasses: number;
  remindersEnabled: boolean;
  // Matches Profile.interestedTopics (lib/db/schema.ts), which is stored as
  // plain string[] rather than HealthTopicId[] — this keeps the field
  // assignable both ways without a cast at the Settings/onboarding seam.
  interestedTopics: string[];
}

interface PreferencesFieldsProps {
  value: PreferencesValue;
  onChange: (patch: Partial<PreferencesValue>) => void;
}

/**
 * The preference fields shared by onboarding (F1-AC2) and Settings
 * (F11-AC1): name, water target, reminder opt-in, interested topics.
 * Purely controlled — the parent owns state and persistence so this stays
 * reusable across both screens without knowing about Dexie.
 */
export function PreferencesFields({ value, onChange }: PreferencesFieldsProps) {
  function toggleTopic(id: HealthTopicId) {
    const next = value.interestedTopics.includes(id)
      ? value.interestedTopics.filter((t) => t !== id)
      : [...value.interestedTopics, id];
    onChange({ interestedTopics: next });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="pref-name" className="text-lg font-medium">
          What should we call you?{" "}
          <span className="font-normal text-black/60 dark:text-white/60">(optional)</span>
        </label>
        <input
          id="pref-name"
          type="text"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="First name"
          className="min-h-11 rounded-lg border border-black/20 px-4 py-2 text-lg dark:border-white/30 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="pref-water" className="text-lg font-medium">
          Daily water goal
        </label>
        <div className="flex items-center gap-3">
          <input
            id="pref-water"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={value.waterTargetGlasses}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ waterTargetGlasses: Number.isFinite(n) && n > 0 ? n : 1 });
            }}
            className="min-h-11 w-24 rounded-lg border border-black/20 px-4 py-2 text-lg dark:border-white/30 dark:bg-transparent"
          />
          <span className="text-lg">glasses a day</span>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="pref-reminders"
          type="checkbox"
          checked={value.remindersEnabled}
          onChange={(e) => onChange({ remindersEnabled: e.target.checked })}
          className="mt-1 h-6 w-6 shrink-0"
        />
        <label htmlFor="pref-reminders" className="text-lg">
          Send me gentle reminders to check in and drink water
        </label>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-medium">
          What would you like guidance on?{" "}
          <span className="font-normal text-black/60 dark:text-white/60">(optional)</span>
        </legend>
        {HEALTH_TOPIC_OPTIONS.map((topic) => (
          <div key={topic.id} className="flex items-start gap-3">
            <input
              id={`pref-topic-${topic.id}`}
              type="checkbox"
              checked={value.interestedTopics.includes(topic.id)}
              onChange={() => toggleTopic(topic.id)}
              className="mt-1 h-6 w-6 shrink-0"
            />
            <label htmlFor={`pref-topic-${topic.id}`} className="text-lg">
              {topic.label}
            </label>
          </div>
        ))}
      </fieldset>
    </div>
  );
}
