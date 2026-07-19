interface ReminderBannerProps {
  message: string;
  actionLabel: string;
  /** Same-page anchor (e.g. scroll to Quick log) — renders a plain link. */
  href?: string;
  /** Button action (e.g. open the check-in modal) — renders a button. */
  onAction?: () => void;
}

/**
 * F9-AC1: a gentle in-app nudge, visually distinct from the neutral
 * disclaimer boxes elsewhere (a soft amber tint, not used anywhere else in
 * the app, so it reads as "worth a glance" without being alarming — Settings
 * already reserves red for destructive actions, so amber stays unambiguous)
 * but never color-only: the message text and action label carry the
 * meaning (`C4`).
 */
export function ReminderBanner({ message, actionLabel, href, onAction }: ReminderBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-600/50 bg-amber-50 p-4 text-lg dark:border-amber-400/40 dark:bg-amber-950/40">
      <p>{message}</p>
      {href ? (
        <a href={href} className="flex min-h-11 items-center self-start text-lg font-medium underline">
          {actionLabel}
        </a>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="min-h-11 self-start rounded-full border border-black/20 px-5 py-2 text-lg font-medium dark:border-white/30"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
