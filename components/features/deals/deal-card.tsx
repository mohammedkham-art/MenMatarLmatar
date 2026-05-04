import type { Deal, DealVisaType } from '@/services/deals/get-deals';

type DealCardProps = {
  deal: Deal;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const visaLabels: Record<DealVisaType, string> = {
  visa_free: 'Sans visa',
  evisa: 'eVisa',
  e_visa: 'eVisa',
  on_arrival: 'Visa à l’arrivée',
  visa_on_arrival: 'Visa à l’arrivée',
  visa_required: 'Visa requis - à vérifier',
};

const visaBadgeStyles: Record<DealVisaType, string> = {
  visa_free: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  evisa: 'bg-blue-50 text-blue-700 ring-blue-200',
  e_visa: 'bg-blue-50 text-blue-700 ring-blue-200',
  on_arrival: 'bg-orange-50 text-orange-700 ring-orange-200',
  visa_on_arrival: 'bg-orange-50 text-orange-700 ring-orange-200',
  visa_required: 'bg-red-50 text-red-700 ring-red-200',
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return dateFormatter.format(parsedDate);
}

function getFreshness(deal: Deal) {
  const checkedAt = new Date(deal.lastCheckedAt ?? deal.createdAt);
  const diffHours = Math.floor(
    (Date.now() - checkedAt.getTime()) / (1000 * 60 * 60),
  );

  if (Number.isNaN(diffHours) || diffHours > 48) {
    return {
      label: 'À vérifier',
      className: 'text-orange-700',
    };
  }

  if (diffHours <= 48) {
    return {
      label: 'Prix repéré récemment',
      className: 'text-emerald-700',
    };
  }

  return {
    label: 'À vérifier',
    className: 'text-orange-700',
  };
}

export function DealCard({ deal }: DealCardProps) {
  const departureDate = deal.departureDate
    ? formatDate(deal.departureDate)
    : null;
  const returnDate = deal.returnDate ? formatDate(deal.returnDate) : null;
  const formattedPrice = deal.priceMad.toLocaleString('fr-MA');
  const freshness = getFreshness(deal);
  const visibleVisaType = deal.visaType;

  return (
    <article className="flex h-full flex-col rounded-xl border bg-background p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {deal.isFeatured && (
            <span className="mb-3 inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground ring-1 ring-inset ring-accent/30">
              Meilleure offre
            </span>
          )}
          <p className={`mb-2 text-xs font-semibold ${freshness.className}`}>
            {freshness.label}
          </p>
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
          <h2 className="mt-2 text-xl font-semibold leading-7">
            {deal.fromCity} → {deal.toCity}
          </h2>
          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
            {deal.toCity}
            {visibleVisaType ? ` • ${visaLabels[visibleVisaType]}` : ''}
          </p>
        </div>

        <div className="shrink-0 whitespace-nowrap rounded-xl bg-muted px-4 py-3 text-right">
          <p className="text-sm font-medium text-muted-foreground">
            À partir de
          </p>
          <p className="mt-1 text-xl font-bold text-primary">
            {formattedPrice} MAD
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-muted p-4">
        <p className="text-sm font-semibold">
          {deal.fromAirport} → {deal.toAirport}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {deal.fromCity} → {deal.toCity}
        </p>
      </div>

      <div className="mt-5 space-y-2 text-sm text-muted-foreground">
        {deal.airline && (
          <p>
            <span className="font-semibold text-foreground">Compagnie :</span>{' '}
            {deal.airline}
          </p>
        )}
        {departureDate && (
          <p>
            <span className="font-semibold text-foreground">Départ :</span>{' '}
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

      {deal.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {deal.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <a
        href={deal.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Voir l’offre ↗
      </a>
    </article>
  );
}
