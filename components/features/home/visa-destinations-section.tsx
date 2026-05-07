import Link from 'next/link';

import { CountryCard } from '@/components/features/countries/country-card';
import type { Country } from '@/services/countries/get-countries';

type VisaDestinationsSectionProps = {
  countries: Country[];
};

type HomeVisaGroup = {
  title: string;
  visaTypes: string[];
};

const visaGroups: HomeVisaGroup[] = [
  {
    title: '🟢 Sans visa',
    visaTypes: ['visa_free'],
  },
  {
    title: '🔵 eVisa',
    visaTypes: ['evisa', 'e_visa'],
  },
  {
    title: '🟡 Visa à l’arrivée',
    visaTypes: ['on_arrival', 'visa_on_arrival'],
  },
];

function getCountriesByVisaType(countries: Country[], visaTypes: string[]) {
  return countries
    .filter((country) => visaTypes.includes(country.visaType))
    .slice(0, 3);
}

export function VisaDestinationsSection({
  countries,
}: VisaDestinationsSectionProps) {
  return (
    <section id="destinations-accessibles" className="border-y bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">
              Voyager facilement depuis le Maroc
            </h2>
            <p className="mt-3 text-muted-foreground">
              Des destinations accessibles, regroupées par type de visa pour
              décider plus vite.
            </p>
          </div>
          <Link
            href="/destinations"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Voir toutes les destinations →
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {visaGroups.map((group) => {
            const groupCountries = getCountriesByVisaType(
              countries,
              group.visaTypes,
            );

            return (
              <section
                key={group.title}
                className="rounded-xl border bg-muted/40 p-4"
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {group.title}
                </h3>
                <div className="mt-4 grid gap-3">
                  {groupCountries.map((country) => (
                    <CountryCard
                      key={country.id}
                      country={country}
                      variant="compact"
                    />
                  ))}
                  {groupCountries.length === 0 && (
                    <p className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                      Aucune destination disponible pour le moment.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
