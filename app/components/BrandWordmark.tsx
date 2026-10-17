export default function BrandWordmark({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <span className="inline-flex min-w-0 flex-col leading-none">
      <span
        className={`${compact ? "text-lg" : "text-xl"} font-bold tracking-[-0.065em]`}
      >
        <span className="text-primary">K</span>
        <span className="text-white">-Dent</span>
        <span className="text-primary">.</span>
      </span>
      {!compact && (
        <span className="mt-1 text-[8px] font-semibold tracking-[0.2em] text-white/50 uppercase">
          Dental Healthcare
        </span>
      )}
    </span>
  );
}
