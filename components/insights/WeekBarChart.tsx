interface WeekBarChartDatum {
  date: string; // "YYYY-MM-DD"
  value: number;
}

interface WeekBarChartProps {
  data: WeekBarChartDatum[]; // 7 entries, chronological, oldest first
  unit: string; // e.g. "glasses", "min" — used only in the aria-label, not drawn
}

function dayAbbrev(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" }).format(dt);
}

/**
 * F6-AC4: a 7-day trend as plain CSS bars — no charting library, per PRD
 * Section 12's data-thrift guidance ("prefer lightweight, dependency-light
 * visuals... a small charting library is acceptable only if it does not
 * materially grow first-load transfer"). Bar height is relative to the
 * week's own max, not an absolute scale, since these are small daily counts
 * (glasses, minutes) with no fixed ceiling.
 */
export function WeekBarChart({ data, unit }: WeekBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div
      className="flex items-end gap-2"
      role="img"
      aria-label={data.map((d) => `${dayAbbrev(d.date)}: ${d.value} ${unit}`).join(", ")}
    >
      {data.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-lg">{d.value}</span>
          <div className="flex h-24 w-full items-end">
            <div
              className="w-full rounded-t bg-foreground"
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-lg text-black/60 dark:text-white/60">{dayAbbrev(d.date)}</span>
        </div>
      ))}
    </div>
  );
}
