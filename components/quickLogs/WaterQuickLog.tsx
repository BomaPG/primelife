interface WaterQuickLogProps {
  glasses: number;
  target: number;
  onAdd: () => void;
  onRemove: () => void;
}

/** F4-AC1: one tap adds a glass, a second control removes one. */
export function WaterQuickLog({ glasses, target, onAdd, onRemove }: WaterQuickLogProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-lg font-medium">Water</p>
        <p className="text-lg text-black/70 dark:text-white/70">
          {glasses} of {target} glasses
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRemove}
          disabled={glasses <= 0}
          aria-label="Remove a glass of water"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-black/20 text-xl disabled:opacity-40 dark:border-white/30"
        >
          &minus;
        </button>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add a glass of water"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-foreground text-xl text-background"
        >
          +
        </button>
      </div>
    </div>
  );
}
