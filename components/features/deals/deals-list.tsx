'use client';

import { useMemo, useState } from 'react';

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

const filters: Array<{
  label: string;
  value: DealFilter;
}> = [
  { label: 'Tous', value: 'all' },
  { label: 'Sans visa', value: 'visa_free' },
  { label: 'eVisa', value: 'evisa' },
  { label: 'Visa à l’arrivée', value: 'on_arrival' },
  { label: 'Moins de 2000 MAD', value: 'under_2000_mad' },
  { label: 'Meilleures offres', value: 'featured' },
];

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

export function DealsList({ deals }: DealsListProps) {
  const [activeFilter, setActiveFilter] = useState<DealFilter>('all');

  const filteredDeals = useMemo(() => {
    switch (activeFilter) {
      case 'visa_free':
      case 'evisa':
      case 'on_arrival':
        return deals.filter((deal) => matchesVisaFilter(deal, activeFilter));
      case 'under_2000_mad':
        return deals.filter((deal) => deal.priceMad < 2000);
      case 'featured':
        return deals.filter((deal) => deal.isFeatured);
      case 'all':
      default:
        return deals;
    }
  }, [activeFilter, deals]);

  return (
    <section className="mt-10">
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

      {filteredDeals.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border bg-background p-8 text-center text-muted-foreground">
          Aucune offre ne correspond à ce filtre.
        </div>
      )}
    </section>
  );
}
