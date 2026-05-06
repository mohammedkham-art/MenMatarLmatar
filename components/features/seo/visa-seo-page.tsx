import Link from 'next/link';

import { CountryCard } from '@/components/features/countries/country-card';
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';
import type { Country, VisaType } from '@/services/countries/get-countries';

type VisaSeoPageProps = {
  countries: Country[];
  description: string;
  filterHref: string;
  highlights: string[];
  intro: string;
  title: string;
  visaTypes: VisaType[];
};

export function VisaSeoPage({
  countries,
  description,
  filterHref,
  highlights,
  intro,
  title,
  visaTypes,
}: VisaSeoPageProps) {
  const matchingCountries = countries
    .filter((country) => visaTypes.includes(country.visaType))
    .slice(0, 9);

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Passeport marocain
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {description}
          </p>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-800">
            Informations indicatives. Vérifie toujours les règles visa,
            passeport, transit et entrée auprès des autorités officielles avant
            de réserver ou de partir.
          </p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight} className="rounded-xl border bg-muted/35 p-5">
              <p className="text-sm font-semibold leading-6">{highlight}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight">
            Comment utiliser cette liste ?
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">{intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={filterHref}
              className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Voir toutes les destinations
            </Link>
            <Link
              href="/deals"
              className="inline-flex h-11 items-center rounded-xl border bg-background px-5 text-sm font-bold text-primary transition hover:bg-muted"
            >
              Voir les bons plans
            </Link>
            <Link
              href="/simulator"
              className="inline-flex h-11 items-center rounded-xl border bg-background px-5 text-sm font-bold text-primary transition hover:bg-muted"
            >
              Tester le simulateur IA
            </Link>
          </div>
        </section>

        {matchingCountries.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Exemples de destinations
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quelques pays affichés depuis la base Men Matar L Matar.
                </p>
              </div>
              <Link
                href={filterHref}
                className="text-sm font-bold text-primary hover:underline"
              >
                Liste complète →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchingCountries.map((country) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <PublicFooter />
    </main>
  );
}
