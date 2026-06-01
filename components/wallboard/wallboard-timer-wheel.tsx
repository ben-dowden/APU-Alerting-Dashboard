type WallboardTimerWheelProps = {
  intervalMs: number;
  label: string;
  remainingMs: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function WallboardTimerWheel({ intervalMs, label, remainingMs }: WallboardTimerWheelProps) {
  const secondsRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
  const progress = intervalMs > 0 ? clamp(remainingMs / intervalMs, 0, 1) : 0;

  return (
    <div
      aria-label={`${label} in ${secondsRemaining}s`}
      className="flex items-center gap-1.5 text-xs font-semibold leading-none tabular-nums text-neutral-500"
      data-interval-ms={intervalMs}
      data-remaining-ms={remainingMs}
      role="timer"
    >
      <span
        aria-hidden="true"
        className="size-4 rounded-full border border-neutral-300"
        style={{
          background: `conic-gradient(#525252 ${progress * 360}deg, #e5e5e5 0deg)`,
        }}
      />
      <span>{secondsRemaining}s</span>
    </div>
  );
}
