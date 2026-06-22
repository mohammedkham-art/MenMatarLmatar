import type { Metadata } from 'next';
import { CountriesList } from '@/components/features/countries/countries-list';

export const metadata: Metadata = {
  description:
    "88 destinations accessibles avec le passeport marocain : sans visa, eVisa, visa à l'arrivée. Infos par pays.",
};
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';
import { fallbackCountries } from '@/services/countries/fallback-countries';
import { getCountries } from '@/services/countries/get-countries';
import type { VisaType } from '@/services/countries/get-countries';

type DestinationsPageProps = {
  searchParams?: Promise<{
    visa?: string;
  }>;
};

function getInitialVisaFilter(visa?: string): VisaType | 'all' {
  if (visa === 'visa_free') {
    return 'visa_free';
  }

  if (visa === 'evisa' || visa === 'e_visa') {
    return 'e_visa';
  }

  if (visa === 'on_arrival' || visa === 'visa_on_arrival') {
    return 'visa_on_arrival';
  }

  if (visa === 'visa_required') {
    return 'visa_required';
  }

  return 'all';
}

export default async function DestinationsPage({
  searchParams,
}: DestinationsPageProps) {
  const params = await searchParams;
  const countries = await getCountries().catch(() => fallbackCountries);
  const initialFilter = getInitialVisaFilter(params?.visa);

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Destinations accessibles
          </h1>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Informations indicatives - à vérifier avant de voyager auprès des
            autorités officielles.
          </p>
          <p className="mt-3 text-muted-foreground">
            Explore les destinations accessibles selon le type de visa et la
            région.
          </p>
        </header>

        <CountriesList countries={countries} initialFilter={initialFilter} />
      </div>
      <PublicFooter />
    </main>
  );
}
