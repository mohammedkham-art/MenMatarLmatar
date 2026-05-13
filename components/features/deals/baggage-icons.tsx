import type { AirlineFare } from '@/services/airlines/types';
import { cn } from '@/lib/utils/cn';

type BaggageIconsProps = {
  fare: AirlineFare | null;
  compact?: boolean;
};

const items = [
  {
    key: 'personal',
    label: 'Effet personnel',
    icon: 'P',
  },
  {
    key: 'cabin',
    label: 'Cabine',
    icon: 'C',
  },
  {
    key: 'checked',
    label: 'Soute',
    icon: 'S',
  },
] as const;

function getBaggageState(
  fare: AirlineFare | null,
  key: (typeof items)[number]['key'],
) {
  if (!fare) {
    return {
      included: false,
      details: 'Non renseigne',
    };
  }

  if (key === 'personal') {
    return {
      included: fare.personalItem,
      details: fare.personalItemDimensions ?? 'Inclus',
    };
  }

  if (key === 'cabin') {
    return {
      included: fare.cabinAllowed,
      details: fare.cabinAllowed
        ? [
            fare.cabinWeightKg ? `${fare.cabinWeightKg} kg` : null,
            fare.cabinDimensions,
          ]
            .filter(Boolean)
            .join(' - ') || 'Inclus'
        : 'Non inclus',
    };
  }

  return {
    included: fare.checkedAllowed,
    details: fare.checkedAllowed
      ? [
          `${fare.checkedCount} bagage${fare.checkedCount > 1 ? 's' : ''}`,
          fare.checkedWeightKg ? `${fare.checkedWeightKg} kg` : null,
        ]
          .filter(Boolean)
          .join(' - ')
      : 'Non inclus',
  };
}

export function BaggageIcons({ compact = false, fare }: BaggageIconsProps) {
  return (
    <div
      className={cn(
        'flex gap-2',
        compact ? 'items-center' : 'grid sm:grid-cols-3',
      )}
    >
      {items.map((item) => {
        const state = getBaggageState(fare, item.key);
        return (
          <div
            key={item.key}
            className={cn(
              'flex items-center gap-3',
              compact ? '' : 'rounded-xl border bg-background p-4 shadow-sm',
              !state.included && 'text-muted-foreground',
            )}
          >
            <span
              title={item.label}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full border text-xs font-black',
                compact ? 'size-8' : 'size-11',
                state.included
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-muted-foreground/25 bg-muted text-muted-foreground line-through',
              )}
            >
              {item.icon}
            </span>
            {!compact && (
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">
                  {item.label}
                </span>
                <span
                  className={cn(
                    'mt-1 block text-sm',
                    !state.included && 'line-through',
                  )}
                >
                  {state.details}
                </span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
