'use client';

import { useMemo, useState } from 'react';

import { CountryCard } from '@/components/features/countries/country-card';
import { cn } from '@/lib/utils/cn';
import type { Country, VisaType } from '@/services/countries/get-countries';

type VisaFilter = VisaType | 'all';

type CountriesListProps = {
  countries: Country[];
  initialFilter?: VisaFilter;
};

const filters: Array<{
  label: string;
  value: VisaFilter;
}> = [
  { label: 'Tous', value: 'all' },
  { label: 'Sans visa', value: 'visa_free' },
  { label: 'eVisa', value: 'e_visa' },
  { label: 'Visa à l’arrivée', value: 'visa_on_arrival' },
];

function matchesVisaFilter(country: Country, activeFilter: VisaFilter) {
  if (activeFilter === 'all') {
    return true;
  }

  if (activeFilter === 'evisa' || activeFilter === 'e_visa') {
    return country.visaType === 'evisa' || country.visaType === 'e_visa';
  }

  if (activeFilter === 'on_arrival' || activeFilter === 'visa_on_arrival') {
    return (
      country.visaType === 'on_arrival' ||
      country.visaType === 'visa_on_arrival'
    );
  }

  return country.visaType === activeFilter;
}

export function CountriesList({
  countries,
  initialFilter = 'all',
}: CountriesListProps) {
  const [activeFilter, setActiveFilter] = useState<VisaFilter>(initialFilter);

  const filteredCountries = useMemo(
    () =>
      countries.filter((country) => matchesVisaFilter(country, activeFilter)),
    [activeFilter, countries],
  );

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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCountries.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
    </section>
  );
}
