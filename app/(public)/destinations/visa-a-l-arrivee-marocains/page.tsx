import type { Metadata } from 'next';

import { VisaSeoPage } from '@/components/features/seo/visa-seo-page';
import { fallbackCountries } from '@/services/countries/fallback-countries';
import { getCountries } from '@/services/countries/get-countries';

export const metadata: Metadata = {
  title: 'Visa à l’arrivée pour les Marocains | Men Matar L Matar',
  description:
    'Liste de destinations avec visa à l’arrivée pour passeport marocain, avec rappel de vérification officielle avant départ.',
  alternates: {
    canonical: '/destinations/visa-a-l-arrivee-marocains',
  },
};

export default async function VisaOnArrivalMoroccanDestinationsPage() {
  const countries = await getCountries().catch(() => fallbackCountries);

  return (
    <VisaSeoPage
      countries={countries}
      title="Visa à l’arrivée pour les Marocains"
      description="Certaines destinations permettent une formalité à l’arrivée. Men Matar L Matar t’aide à les repérer avant de chercher un bon plan de vol."
      filterHref="/destinations?visa=visa_on_arrival"
      visaTypes={['on_arrival', 'visa_on_arrival']}
      highlights={[
        'Pratique pour explorer des options flexibles.',
        'Les frais, documents et conditions peuvent varier selon le pays.',
        'Toujours vérifier les sources officielles avant d’acheter le billet.',
      ]}
      intro="Utilise cette page comme point de départ : identifie les pays avec visa à l’arrivée, compare les offres depuis le Maroc, puis simule un itinéraire réaliste selon ton budget."
    />
  );
}
