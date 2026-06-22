'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { DealCard } from '@/components/features/deals/deal-card';
import { cn } from '@/lib/utils/cn';
import type { Deal } from '@/services/deals/get-deals';

type DealsListProps = {
  deals: Deal[];
};

type DealFilter =
  | 'all'
  | 'visa_free'
  | 'evisa'
  | 'on_arrival'
  | 'under_2000_mad'
  | 'featured';

const filters: Array<{ label: string; value: DealFilter }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Sans visa', value: 'visa_free' },
  { label: 'eVisa', value: 'evisa' },
  { label: 'Visa à l’arrivée', value: 'on_arrival' },
  { label: 'Moins de 2000 MAD', value: 'under_2000_mad' },
  { label: 'Meilleures offres', value: 'featured' },
];

const shortDateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
});

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : shortDateFmt.format(d);
}

function matchesVisaFilter(deal: Deal, activeFilter: DealFilter) {
  if (activeFilter === 'evisa') {
    return deal.visaType === 'evisa' || deal.visaType === 'e_visa';
  }
  if (activeFilter === 'on_arrival') {
    return (
      deal.visaType === 'on_arrival' || deal.visaType === 'visa_on_arrival'
    );
  }
  return deal.visaType === activeFilter;
}

function matchesDateRange(deal: Deal, from: string, to: string) {
  if (!deal.departureDate) return false;
  const dep = new Date(deal.departureDate);
  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59);
  return dep >= fromDate && dep <= toDate;
}

export function DealsList({ deals }: DealsListProps) {
  const [activeFilter, setActiveFilter] = useState<DealFilter>('all');
  const [showDatePanel, setShowDatePanel] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeDateFrom, setActiveDateFrom] = useState('');
  const [activeDateTo, setActiveDateTo] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  const hasDateFilter = Boolean(activeDateFrom && activeDateTo);

  // Close panel on outside click
  useEffect(() => {
    if (!showDatePanel) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowDatePanel(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDatePanel]);

  const filteredDeals = useMemo(() => {
    let result = deals;

    switch (activeFilter) {
      case 'visa_free':
      case 'evisa':
      case 'on_arrival':
        result = result.filter((deal) => matchesVisaFilter(deal, activeFilter));
        break;
      case 'under_2000_mad':
        result = result.filter((deal) => deal.priceMad < 2000);
        break;
      case 'featured':
        result = result.filter((deal) => deal.isFeatured);
        break;
    }

    if (activeDateFrom && activeDateTo) {
      result = result.filter((deal) =>
        matchesDateRange(deal, activeDateFrom, activeDateTo),
      );
    }

    return result;
  }, [activeFilter, activeDateFrom, activeDateTo, deals]);

  function applyDates() {
    if (!dateFrom || !dateTo) return;
    setActiveDateFrom(dateFrom);
    setActiveDateTo(dateTo);
    setShowDatePanel(false);
  }

  function resetDates() {
    setDateFrom('');
    setDateTo('');
    setActiveDateFrom('');
    setActiveDateTo('');
    setShowDatePanel(false);
  }

  const emptyMessage = hasDateFilter
    ? 'Aucun deal sur cette période — reviens bientôt, on en ajoute régulièrement.'
    : 'Aucune offre ne correspond à ce filtre.';

  return (
    <section className="mt-10">
      {/* Filtres visa / prix */}
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-muted',
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Filtre dates de congés */}
      <div className="relative mt-4" ref={panelRef}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDatePanel((v) => !v)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
              hasDateFilter
                ? 'border-accent bg-accent/15 text-accent-foreground ring-1 ring-inset ring-accent/30'
                : 'bg-background text-foreground hover:bg-muted',
            )}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {hasDateFilter
              ? `${formatShortDate(activeDateFrom)} → ${formatShortDate(activeDateTo)}`
              : 'Mes dates de congés'}
          </button>

          {hasDateFilter && (
            <button
              type="button"
              onClick={resetDates}
              className="rounded-full border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
              aria-label="Réinitialiser le filtre de dates"
            >
              ✕ Effacer
            </button>
          )}
        </div>

        {showDatePanel && (
          <div className="absolute left-0 top-full z-20 mt-2 w-[calc(100vw-3rem)] max-w-sm rounded-2xl border bg-background p-5 shadow-xl">
            <p className="mb-4 text-sm font-black">
              Sélectionne ta période de congés
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label
                  className="text-xs font-bold text-muted-foreground"
                  htmlFor="date-from"
                >
                  Du
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    if (dateTo && e.target.value > dateTo) setDateTo('');
                  }}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring-2"
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  className="text-xs font-bold text-muted-foreground"
                  htmlFor="date-to"
                >
                  Au
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring-2"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={applyDates}
              disabled={!dateFrom || !dateTo}
              className="mt-4 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              Appliquer
            </button>
          </div>
        )}
      </div>

      {filteredDeals.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border bg-background p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}
