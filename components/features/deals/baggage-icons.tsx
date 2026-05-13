import { cn } from '@/lib/utils/cn';
import type { AirlineFare } from '@/services/airlines/types';

type BaggageIconsProps = {
  fare: AirlineFare | null;
  compact?: boolean;
};

type BaggageKey = 'personal' | 'cabin' | 'checked';

type BaggageState = {
  count: number;
  details: string;
  included: boolean;
  key: BaggageKey;
  label: string;
};

function BagIcon({ type }: { type: BaggageKey }) {
  if (type === 'personal') {
    return (
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
        <path
          d="M8 8V6a4 4 0 0 1 8 0v2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M5 9h14l1 10H4L5 9Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path d="M9 12h6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'cabin') {
    return (
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
        <path
          d="M9 7V5a3 3 0 0 1 6 0v2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <rect
          height="12"
          rx="2"
          width="10"
          x="7"
          y="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M10 20v1M14 20v1" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <rect
        height="13"
        rx="2"
        width="14"
        x="5"
        y="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M9 10v5M15 10v5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function getBaggageStates(fare: AirlineFare | null): BaggageState[] {
  if (!fare) {
    return [
      {
        count: 1,
        details: 'A verifier avec la compagnie',
        included: true,
        key: 'personal',
        label: 'Effet personnel',
      },
      {
        count: 1,
        details: 'A verifier avec la compagnie',
        included: true,
        key: 'cabin',
        label: 'Cabine',
      },
      {
        count: 0,
        details: 'A verifier avec la compagnie',
        included: false,
        key: 'checked',
        label: 'Soute',
      },
    ];
  }

  return [
    {
      count: fare.personalItem ? 1 : 0,
      details: fare.personalItemDimensions ?? 'Inclus',
      included: fare.personalItem,
      key: 'personal',
      label: 'Effet personnel',
    },
    {
      count: fare.cabinAllowed ? 1 : 0,
      details: fare.cabinAllowed
        ? [
            fare.cabinWeightKg ? `${fare.cabinWeightKg} kg` : null,
            fare.cabinDimensions,
          ]
            .filter(Boolean)
            .join(' - ') || 'Inclus'
        : 'Non inclus',
      included: fare.cabinAllowed,
      key: 'cabin',
      label: 'Cabine',
    },
    {
      count: fare.checkedAllowed ? fare.checkedCount : 0,
      details: fare.checkedAllowed
        ? [
            `${fare.checkedCount} bagage${fare.checkedCount > 1 ? 's' : ''}`,
            fare.checkedWeightKg ? `${fare.checkedWeightKg} kg` : null,
          ]
            .filter(Boolean)
            .join(' - ')
        : 'Non inclus',
      included: fare.checkedAllowed,
      key: 'checked',
      label: 'Soute',
    },
  ];
}

export function BaggageIcons({ compact = false, fare }: BaggageIconsProps) {
  const states = getBaggageStates(fare);

  if (compact) {
    return (
      <div
        aria-label="Bagages inclus"
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-background/80 px-1 text-sm font-bold text-foreground"
      >
        {states.map((state) => (
          <span
            key={state.key}
            title={`${state.label}: ${state.details}`}
            className={cn(
              'inline-flex items-center gap-0.5',
              !state.included && 'text-muted-foreground',
            )}
          >
            <span>{state.count}</span>
            <BagIcon type={state.key} />
          </span>
        ))}
        <span className="text-muted-foreground">
          <ChevronDownIcon />
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {states.map((state) => (
        <div
          key={state.key}
          className={cn(
            'flex items-center gap-3 rounded-xl border bg-background p-4 shadow-sm',
            !state.included && 'text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-2 text-sm font-black',
              state.included
                ? 'border-foreground/15 text-foreground'
                : 'border-muted-foreground/25 text-muted-foreground',
            )}
          >
            {state.count}
            <BagIcon type={state.key} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-foreground">
              {state.label}
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
        </div>
      ))}
    </div>
  );
}
