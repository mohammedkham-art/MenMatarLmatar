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

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchesSearch(country: Country, query: string) {
  const normalizedQuery = normalizeSearchValue(query.trim());

  if (!normalizedQuery) {
    return true;
  }

  return [
    country.name,
    country.code,
    country.region,
    country.notes ?? '',
  ].some((value) => normalizeSearchValue(value).includes(normalizedQuery));
}

export function CountriesList({
  countries,
  initialFilter = 'all',
}: CountriesListProps) {
  const [activeFilter, setActiveFilter] = useState<VisaFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(
    () =>
      countries.filter(
        (country) =>
          matchesVisaFilter(country, activeFilter) &&
          matchesSearch(country, searchQuery),
      ),
    [activeFilter, countries, searchQuery],
  );

  return (
    <section className="mt-10">
      <div className="rounded-2xl border bg-background p-4 shadow-sm">
        <label
          htmlFor="country-search"
          className="text-xs font-black uppercase tracking-[0.18em] text-primary/70"
        >
          Recherche par pays
        </label>
        <input
          id="country-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Ex: Turquie, Thaïlande, AE..."
          className="mt-3 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
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

      {filteredCountries.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border bg-background p-8 text-center text-muted-foreground">
          Aucun pays ne correspond à cette recherche.
        </div>
      )}
    </section>
  );
}
