import type { Metadata } from 'next';

import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Men Matar L Matar',
  description:
    'Politique de confidentialité de Men Matar L Matar. Découvrez comment nous traitons vos données.',
  alternates: {
    canonical: '/privacy',
  },
};

const lastUpdated = '09 mai 2026';
const contactEmail = 'contact@menmatarlmatar.ma';
const siteUrl = 'https://menmatarlmatar.ma';

export default function PrivacyPage() {
  return (
    <main>
      <PublicHeader />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-black uppercase tracking-widest text-primary/70">
          Légal
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Dernière mise à jour : {lastUpdated}
        </p>

        <div className="mt-10 space-y-10 text-base leading-7 text-foreground">

          <article>
            <h2 className="text-xl font-black">1. Qui sommes-nous ?</h2>
            <p className="mt-3 text-muted-foreground">
              Men Matar L Matar est une application web et mobile destinée aux
              voyageurs marocains. Elle permet de consulter des bons plans de
              vols, des informations visa et de simuler un itinéraire de voyage
              grâce à l'intelligence artificielle.
            </p>
            <p className="mt-3 text-muted-foreground">
              Site web : <span className="font-semibold text-foreground">{siteUrl}</span>
              <br />
              Contact : <span className="font-semibold text-foreground">{contactEmail}</span>
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">2. Données collectées</h2>
            <p className="mt-3 text-muted-foreground">
              Nous collectons un minimum de données pour faire fonctionner le service.
            </p>

            <h3 className="mt-5 font-black">Données collectées automatiquement</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Adresse IP (utilisée uniquement pour la limitation des requêtes au simulateur IA)</li>
              <li>Pages visitées, durée de visite (via Google Analytics et Vercel Analytics)</li>
              <li>Événements de navigation (via Meta Pixel, si applicable)</li>
            </ul>

            <h3 className="mt-5 font-black">Données saisies dans le simulateur IA</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Destination choisie</li>
              <li>Date d'arrivée et durée du séjour</li>
              <li>Budget indicatif (facultatif)</li>
              <li>Type de voyageur et style de voyage</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Ces données sont transmises à OpenAI pour générer la simulation.
              Elles ne sont <span className="font-semibold text-foreground">pas stockées</span> sur
              nos serveurs après traitement.
            </p>

            <h3 className="mt-5 font-black">Données non collectées</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Nom, prénom, e-mail (aucun compte requis)</li>
              <li>Données de paiement</li>
              <li>Localisation GPS</li>
              <li>Contacts ou fichiers du téléphone</li>
            </ul>
          </article>

          <article>
            <h2 className="text-xl font-black">3. Comment nous utilisons ces données</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Générer votre simulation de voyage via l'IA (OpenAI)</li>
              <li>Limiter les abus du simulateur (rate limiting par adresse IP)</li>
              <li>Améliorer le site via des statistiques anonymes (Google Analytics, Vercel Analytics)</li>
              <li>Mesurer l'audience publicitaire (Meta Pixel)</li>
            </ul>
          </article>

          <article>
            <h2 className="text-xl font-black">4. Services tiers</h2>
            <p className="mt-3 text-muted-foreground">
              Nous utilisons les services suivants, chacun ayant sa propre politique de confidentialité :
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-black">Service</th>
                    <th className="px-4 py-3 text-left font-black">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3 font-semibold">OpenAI</td>
                    <td className="px-4 py-3 text-muted-foreground">Génération du plan de voyage IA</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Vercel</td>
                    <td className="px-4 py-3 text-muted-foreground">Hébergement et analytics anonymes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Google Analytics</td>
                    <td className="px-4 py-3 text-muted-foreground">Statistiques de fréquentation</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Meta Pixel</td>
                    <td className="px-4 py-3 text-muted-foreground">Mesure des campagnes publicitaires</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Supabase</td>
                    <td className="px-4 py-3 text-muted-foreground">Base de données (deals, destinations)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article>
            <h2 className="text-xl font-black">5. Cookies</h2>
            <p className="mt-3 text-muted-foreground">
              Nous utilisons des cookies techniques indispensables au fonctionnement
              du site (session, préférence de thème) ainsi que des cookies analytiques
              (Google Analytics, Meta Pixel). Aucun cookie publicitaire personnel n'est
              déposé sans consentement.
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">6. Durée de conservation</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Données du simulateur IA : non conservées après la réponse</li>
              <li>Logs d'accès serveur : 30 jours maximum</li>
              <li>Données analytiques : selon les politiques de Google et Meta</li>
            </ul>
          </article>

          <article>
            <h2 className="text-xl font-black">7. Vos droits</h2>
            <p className="mt-3 text-muted-foreground">
              Conformément au RGPD et à la loi 09-08 relative à la protection des
              données personnelles au Maroc, vous disposez des droits suivants :
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement (droit à l'oubli)</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Pour exercer vos droits, contactez-nous à{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="font-semibold text-primary hover:underline"
              >
                {contactEmail}
              </a>
              . Nous répondrons dans un délai de 30 jours.
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">8. Sécurité</h2>
            <p className="mt-3 text-muted-foreground">
              Les échanges entre votre appareil et nos serveurs sont chiffrés via
              HTTPS/TLS. L'accès à nos bases de données est restreint et authentifié.
              Aucune donnée de paiement ne transite par nos serveurs.
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">9. Modifications</h2>
            <p className="mt-3 text-muted-foreground">
              Cette politique peut être mise à jour à tout moment. La date de
              dernière modification est indiquée en haut de cette page. En
              continuant à utiliser l'application après une mise à jour, vous
              acceptez la nouvelle version.
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">10. Contact</h2>
            <p className="mt-3 text-muted-foreground">
              Pour toute question relative à cette politique de confidentialité :
            </p>
            <div className="mt-4 rounded-xl border bg-muted/40 p-5">
              <p className="font-black">Men Matar L Matar</p>
              <p className="mt-1 text-muted-foreground">
                E-mail :{' '}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {contactEmail}
                </a>
              </p>
              <p className="text-muted-foreground">
                Site web :{' '}
                <a
                  href={siteUrl}
                  className="font-semibold text-primary hover:underline"
                >
                  {siteUrl}
                </a>
              </p>
            </div>
          </article>

        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
