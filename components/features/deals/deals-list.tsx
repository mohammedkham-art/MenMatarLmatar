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

type MonthValue = { year: number; month: number }; // month 1-based

const filters: Array<{ label: string; value: DealFilter }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Sans visa', value: 'visa_free' },
  { label: 'eVisa', value: 'evisa' },
  { label: "Visa à l'arrivée", value: 'on_arrival' },
  { label: 'Moins de 2000 MAD', value: 'under_2000_mad' },
  { label: 'Meilleures offres', value: 'featured' },
];

function toMonthKey(m: MonthValue) {
  return m.year * 100 + m.month;
}

function formatMonthLabel(m: MonthValue) {
  return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' })
    .format(new Date(m.year, m.month - 1, 1))
    .replace('.', '');
}

function formatMonthName(m: MonthValue) {
  return new Intl.DateTimeFormat('fr-FR', { month: 'short' })
    .format(new Date(m.year, m.month - 1, 1))
    .replace('.', '');
}

function getRollingMonths(): MonthValue[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
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

function dealInMonthRange(deal: Deal, from: MonthValue, to: MonthValue) {
  if (!deal.departureDate) return false;
  const d = new Date(deal.departureDate);
  const key = d.getFullYear() * 100 + (d.getMonth() + 1);
  return key >= toMonthKey(from) && key <= toMonthKey(to);
}

export function DealsList({ deals }: DealsListProps) {
  const [activeFilter, setActiveFilter] = useState<DealFilter>('all');
  const [showDatePanel, setShowDatePanel] = useState(false);

  const [draftFrom, setDraftFrom] = useState<MonthValue | null>(null);
  const [draftTo, setDraftTo] = useState<MonthValue | null>(null);
  const [activeFrom, setActiveFrom] = useState<MonthValue | null>(null);
  const [activeTo, setActiveTo] = useState<MonthValue | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const months = useMemo(getRollingMonths, []);
  const hasDateFilter = Boolean(activeFrom && activeTo);

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

  function openPanel() {
    if (!showDatePanel) {
      setDraftFrom(activeFrom);
      setDraftTo(activeTo);
    }
    setShowDatePanel((v) => !v);
  }

  function handleMonthClick(m: MonthValue) {
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(m);
      setDraftTo(null);
    } else {
      const key = toMonthKey(m);
      const fromKey = toMonthKey(draftFrom);
      if (key === fromKey) {
        setDraftTo(m);
      } else if (key < fromKey) {
        setDraftFrom(m);
        setDraftTo(draftFrom);
      } else {
        setDraftTo(m);
      }
    }
  }

  function getMonthState(
    m: MonthValue,
  ): 'start' | 'end' | 'in-range' | 'none' {
    if (!draftFrom) return 'none';
    const key = toMonthKey(m);
    const fromKey = toMonthKey(draftFrom);
    const toKey = draftTo ? toMonthKey(draftTo) : fromKey;
    if (key === fromKey && fromKey === toKey) return 'start';
    if (key === fromKey) return 'start';
    if (key === toKey) return 'end';
    if (key > fromKey && key < toKey) return 'in-range';
    return 'none';
  }

  function applyDates() {
    if (!draftFrom || !draftTo) return;
    setActiveFrom(draftFrom);
    setActiveTo(draftTo);
    setShowDatePanel(false);
  }

  function resetDates() {
    setDraftFrom(null);
    setDraftTo(null);
    setActiveFrom(null);
    setActiveTo(null);
    setShowDatePanel(false);
  }

  const badgeLabel =
    activeFrom && activeTo
      ? toMonthKey(activeFrom) === toMonthKey(activeTo)
        ? formatMonthLabel(activeFrom)
        : `${formatMonthLabel(activeFrom)} → ${formatMonthLabel(activeTo)}`
      : 'Période de voyage';

  const panelHint = !draftFrom
    ? 'Clique pour choisir le mois de début'
    : !draftTo
      ? 'Clique pour choisir le mois de fin'
      : 'Clique un mois pour recommencer';

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

    if (activeFrom && activeTo) {
      result = result.filter((deal) => dealInMonthRange(deal, activeFrom, activeTo));
    }

    return result;
  }, [activeFilter, activeFrom, activeTo, deals]);

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

      {/* Filtre période de voyage */}
      <div className="relative mt-4" ref={panelRef}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openPanel}
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
            {badgeLabel}
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
          <div className="absolute left-0 top-full z-20 mt-2 w-[calc(100vw-3rem)] max-w-md rounded-2xl border bg-background p-5 shadow-xl">
            <p className="text-sm font-black">Période de voyage</p>
            <p className="mb-4 mt-1 text-xs text-muted-foreground">{panelHint}</p>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {months.map((m) => {
                const state = getMonthState(m);
                return (
                  <button
                    key={toMonthKey(m)}
                    type="button"
                    onClick={() => handleMonthClick(m)}
                    className={cn(
                      'rounded-xl px-2 py-2.5 text-center text-sm transition',
                      state === 'start' || state === 'end'
                        ? 'bg-primary font-black text-primary-foreground'
                        : state === 'in-range'
                          ? 'bg-primary/15 font-semibold text-primary'
                          : 'font-semibold text-foreground hover:bg-muted',
                    )}
                  >
                    <span className="block capitalize">{formatMonthName(m)}</span>
                    <span className="block text-[11px] opacity-60">{m.year}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={applyDates}
              disabled={!draftFrom || !draftTo}
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
