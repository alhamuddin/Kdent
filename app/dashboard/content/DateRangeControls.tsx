"use client";

export type DateRange = { start: string; end: string };
export type DatePreset = "weekly" | "monthly" | "yearly" | "custom";

function inputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function presetRange(preset: Exclude<DatePreset, "custom">, now = new Date()): DateRange {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  if (preset === "weekly") {
    const daysSinceMonday = (end.getDay() + 6) % 7;
    start.setDate(end.getDate() - daysSinceMonday);
  } else if (preset === "monthly") {
    start.setDate(1);
  } else {
    start.setMonth(0, 1);
  }
  return { start: inputDate(start), end: inputDate(end) };
}

export function DateRangeControls({
  preset,
  range,
  onPresetChange,
  onRangeChange,
}: {
  preset: DatePreset;
  range: DateRange;
  onPresetChange: (value: DatePreset) => void;
  onRangeChange: (range: DateRange) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-secondary/55 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div aria-label="Report date range" className="flex flex-wrap gap-2" role="group">
        {(["yearly", "monthly", "weekly"] as const).map((value) => (
          <button
            aria-pressed={preset === value}
            className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition ${preset === value ? "border-primary bg-primary text-primary-foreground" : "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"}`}
            key={value}
            onClick={() => onPresetChange(value)}
            type="button"
          >
            {value}
          </button>
        ))}
        <button
          aria-pressed={preset === "custom"}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${preset === "custom" ? "border-primary bg-primary text-primary-foreground" : "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"}`}
          onClick={() => onPresetChange("custom")}
          type="button"
        >
          Custom range
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
        <label className="flex items-center gap-2">From
          <input aria-label="Start date" className="h-9 rounded-lg border border-white/10 bg-background px-2 text-white" max={range.end || undefined} onChange={(event) => { onPresetChange("custom"); onRangeChange({ ...range, start: event.target.value }); }} type="date" value={range.start} />
        </label>
        <label className="flex items-center gap-2">To
          <input aria-label="End date" className="h-9 rounded-lg border border-white/10 bg-background px-2 text-white" min={range.start || undefined} onChange={(event) => { onPresetChange("custom"); onRangeChange({ ...range, end: event.target.value }); }} type="date" value={range.end} />
        </label>
      </div>
    </div>
  );
}
