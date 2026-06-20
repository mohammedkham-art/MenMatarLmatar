import { cn } from '@/lib/utils/cn';
import type { Country, VisaType } from '@/services/countries/get-countries';
import { visaLabels } from '@/services/visa/visa-rules';

function countryCodeToFlag(code: string): string {
  return code.toUpperCase().replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );
}

type CountryCardProps = {
  country: Country;
  variant?: 'default' | 'compact';
};

const visaBadgeStyles: Record<VisaType, string> = {
  visa_free: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  evisa: 'bg-blue-50 text-blue-700 ring-blue-200',
  e_visa: 'bg-blue-50 text-blue-700 ring-blue-200',
  on_arrival: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  visa_on_arrival: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  visa_required: 'bg-red-50 text-red-700 ring-red-200',
};

export function CountryCard({
  country,
  variant = 'default',
}: CountryCardProps) {
  const isCompact = variant === 'compact';

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-xl border bg-background shadow-sm transition hover:border-primary/30 hover:shadow-md',
        isCompact ? 'p-4' : 'p-5',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{country.name}</h2>
            <span className="text-xl">{countryCodeToFlag(country.code)}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{country.region}</p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
            visaBadgeStyles[country.visaType],
          )}
        >
          {visaLabels[country.visaType]}
        </span>
      </div>

      {(country.maxStayDays !== null || (!isCompact && country.notes)) && (
        <div className="mt-5 space-y-3 border-t pt-4">
          {country.maxStayDays !== null && (
            <p className="text-sm">
              <span className="font-semibold">Séjour max :</span>{' '}
              {country.maxStayDays} jours
            </p>
          )}
          {!isCompact && country.notes && (
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
              {country.notes}
            </p>
          )}
        </div>
      )}

      {!isCompact && country.officialSourceUrl && (
        <a
          href={country.officialSourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          Source officielle
        </a>
      )}
    </article>
  );
}
