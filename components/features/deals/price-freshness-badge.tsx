import { cn } from '@/lib/utils/cn';

type PriceFreshnessBadgeProps = {
  checkedAt: string | null | undefined;
  createdAt: string;
  compact?: boolean;
};

export function getPriceFreshness(
  checkedAt: string | null | undefined,
  createdAt: string,
) {
  const date = new Date(checkedAt ?? createdAt);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));

  if (Number.isNaN(diffMinutes) || diffMinutes > 60 * 24 * 7) {
    return {
      label: 'À vérifier',
      className: 'bg-red-50 text-red-700 ring-red-200',
    };
  }

  if (diffMinutes < 60) {
    return {
      label: `Prix repéré il y a ${Math.max(diffMinutes, 1)} min`,
      className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    };
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 48) {
    return {
      label: `Prix repéré il y a ${diffHours}h`,
      className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    };
  }

  const diffDays = Math.floor(diffHours / 24);
  return {
    label: `Prix repéré il y a ${diffDays} jours`,
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  };
}

export function PriceFreshnessBadge({
  checkedAt,
  compact = false,
  createdAt,
}: PriceFreshnessBadgeProps) {
  const freshness = getPriceFreshness(checkedAt, createdAt);

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full font-semibold ring-1 ring-inset',
        compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
        freshness.className,
      )}
    >
      {freshness.label}
    </span>
  );
}
