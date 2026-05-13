import Link from 'next/link';

import { BaggageIcons } from '@/components/features/deals/baggage-icons';
import { PriceFreshnessBadge } from '@/components/features/deals/price-freshness-badge';
import type { Deal, DealVisaType } from '@/services/deals/get-deals';
import { visaLabels } from '@/services/visa/visa-rules';

type DealCardProps = {
  deal: Deal;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const visaBadgeStyles: Record<DealVisaType, string> = {
  visa_free: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  evisa: 'bg-blue-50 text-blue-700 ring-blue-200',
  e_visa: 'bg-blue-50 text-blue-700 ring-blue-200',
  on_arrival: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  visa_on_arrival: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  visa_required: 'bg-red-50 text-red-700 ring-red-200',
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return dateFormatter.format(parsedDate);
}

function getTransitAirport(tags: string[]) {
  const transitTag = tags.find((tag) =>
    tag.toLowerCase().startsWith('transit:'),
  );

  return transitTag?.split(':')[1]?.trim().toUpperCase() ?? null;
}

function getVisibleTags(tags: string[]) {
  return tags.filter((tag) => !tag.toLowerCase().startsWith('transit:'));
}

export function DealCard({ deal }: DealCardProps) {
  const departureDate = deal.departureDate
    ? formatDate(deal.departureDate)
    : null;
  const returnDate = deal.returnDate ? formatDate(deal.returnDate) : null;
  const formattedPrice = deal.priceMad.toLocaleString('fr-MA');
  const visibleVisaType = deal.visaType;
  const transitAirport = getTransitAirport(deal.tags);
  const visibleTags = getVisibleTags(deal.tags);

  return (
    <Link
      href={`/deals/${deal.slug}`}
      className="group flex h-full flex-col rounded-xl border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {deal.isFeatured && (
            <span className="mb-3 inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground ring-1 ring-inset ring-accent/30 dark:bg-accent/25 dark:text-accent dark:ring-accent/50">
              Meilleure offre
            </span>
          )}
          <div className="mb-2">
            <PriceFreshnessBadge
              checkedAt={deal.lastCheckedAt}
              compact
              createdAt={deal.createdAt}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {deal.countryCode}
            </p>
            {visibleVisaType && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${visaBadgeStyles[visibleVisaType]}`}
              >
                {visaLabels[visibleVisaType]}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-7 transition group-hover:text-primary">
            {deal.fromCity} - {deal.toCity}
          </h2>
          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
            {deal.toCity}
            {visibleVisaType ? ` - ${visaLabels[visibleVisaType]}` : ''}
          </p>
        </div>

        <div className="shrink-0 whitespace-nowrap rounded-xl bg-muted px-4 py-3 text-right">
          <p className="text-sm font-medium text-muted-foreground">
            A partir de
          </p>
          <p className="mt-1 text-xl font-bold text-primary">
            {formattedPrice} MAD
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-muted p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">
            {deal.fromAirport} - {deal.toAirport}
          </p>
          {transitAirport && (
            <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent-foreground ring-1 ring-inset ring-accent/30 dark:bg-accent/25 dark:text-accent dark:ring-accent/50">
              Transit via {transitAirport}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {deal.fromCity} - {deal.toCity}
        </p>
      </div>

      <div className="mt-5 space-y-2 text-sm text-muted-foreground">
        {(deal.airlineDetails?.name ?? deal.airline) && (
          <p>
            <span className="font-semibold text-foreground">Compagnie :</span>{' '}
            {deal.airlineDetails?.name ?? deal.airline}
          </p>
        )}
        {departureDate && (
          <p>
            <span className="font-semibold text-foreground">Depart :</span>{' '}
            {departureDate}
          </p>
        )}
        {returnDate && (
          <p>
            <span className="font-semibold text-foreground">Retour :</span>{' '}
            {returnDate}
          </p>
        )}
      </div>

      <div className="mt-5">
        <BaggageIcons compact fare={deal.fare} />
      </div>

      {visibleTags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground dark:bg-accent/25 dark:text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <span className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition group-hover:opacity-90">
        Voir le detail
      </span>
    </Link>
  );
}
