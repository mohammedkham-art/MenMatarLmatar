import type { Metadata } from 'next';

import { VisaSeoPage } from '@/components/features/seo/visa-seo-page';
import { fallbackCountries } from '@/services/countries/fallback-countries';
import { getCountries } from '@/services/countries/get-countries';

export const metadata: Metadata = {
  title: 'Pays sans visa pour les Marocains | Men Matar L Matar',
  description:
    'Découvre des destinations sans visa pour les voyageurs marocains, avec bons plans voyage, infos utiles et simulateur IA.',
  alternates: {
    canonical: '/destinations/sans-visa-marocains',
  },
};

export default async function VisaFreeMoroccanDestinationsPage() {
  const countries = await getCountries().catch(() => fallbackCountries);

  return (
    <VisaSeoPage
      countries={countries}
      title="Pays sans visa pour les Marocains"
      description="Une sélection de destinations accessibles sans visa pour les voyageurs marocains, à explorer avant de réserver ton prochain départ."
      filterHref="/destinations?visa=visa_free"
      visaTypes={['visa_free']}
      highlights={[
        'Idéal pour choisir une destination rapidement.',
        'À croiser avec les dates, le budget et les offres disponibles.',
        'Les règles peuvent changer : vérifie toujours les sources officielles.',
      ]}
      intro="Commence par repérer les pays sans visa, puis compare les offres disponibles depuis le Maroc. Si tu hésites, le simulateur IA peut t’aider à estimer un budget et construire une première idée de séjour."
    />
  );
}
