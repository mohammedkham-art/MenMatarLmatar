import type { Metadata } from 'next';

import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';

export const metadata: Metadata = {
  title: 'Mentions légales — Men Matar L Matar',
  description: 'Mentions légales du site Men Matar L Matar.',
  alternates: {
    canonical: '/legal',
  },
};

const lastUpdated = '09 mai 2026';
const contactEmail = 'contact@menmatarlmatar.ma';
const siteUrl = 'https://menmatarlmatar.ma';

export default function LegalPage() {
  return (
    <main>
      <PublicHeader />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-black uppercase tracking-widest text-primary/70">
          Légal
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Mentions légales
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Dernière mise à jour : {lastUpdated}
        </p>

        <div className="mt-10 space-y-10 text-base leading-7 text-foreground">

          <article>
            <h2 className="text-xl font-black">1. Éditeur du site</h2>
            <div className="mt-4 rounded-xl border bg-muted/40 p-5 text-sm text-muted-foreground">
              <p className="font-black text-foreground">Men Matar L Matar</p>
              <p className="mt-2">
                Site web :{' '}
                <a href={siteUrl} className="font-semibold text-primary hover:underline">
                  {siteUrl}
                </a>
              </p>
              <p>
                Contact :{' '}
                <a href={`mailto:${contactEmail}`} className="font-semibold text-primary hover:underline">
                  {contactEmail}
                </a>
              </p>
            </div>
          </article>

          <article>
            <h2 className="text-xl font-black">2. Hébergement</h2>
            <div className="mt-4 rounded-xl border bg-muted/40 p-5 text-sm text-muted-foreground">
              <p className="font-black text-foreground">Vercel Inc.</p>
              <p className="mt-2">340 Pine Street, Suite 701</p>
              <p>San Francisco, CA 94104 — États-Unis</p>
              <p className="mt-2">
                <a href="https://vercel.com" target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                  vercel.com
                </a>
              </p>
            </div>
          </article>

          <article>
            <h2 className="text-xl font-black">3. Propriété intellectuelle</h2>
            <p className="mt-3 text-muted-foreground">
              L&apos;ensemble des contenus présents sur le site{' '}
              <span className="font-semibold text-foreground">{siteUrl}</span>{' '}
              (textes, images, logos, icônes) est la propriété exclusive de Men Matar L Matar,
              sauf mention contraire. Toute reproduction, représentation ou diffusion,
              totale ou partielle, sans autorisation préalable est interdite.
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">4. Données personnelles</h2>
            <p className="mt-3 text-muted-foreground">
              Le traitement des données personnelles est décrit dans notre{' '}
              <a href="/privacy" className="font-semibold text-primary hover:underline">
                Politique de confidentialité
              </a>
              .
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">5. Cookies</h2>
            <p className="mt-3 text-muted-foreground">
              Le site utilise des cookies analytiques (Google Analytics, Meta Pixel) soumis
              à votre consentement, ainsi que des cookies techniques indispensables au
              fonctionnement du site. Pour en savoir plus, consultez notre{' '}
              <a href="/privacy" className="font-semibold text-primary hover:underline">
                Politique de confidentialité
              </a>
              .
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">6. Limitation de responsabilité</h2>
            <p className="mt-3 text-muted-foreground">
              Les informations diffusées sur ce site (prix de billets, conditions de visa,
              itinéraires générés par IA) sont fournies à titre indicatif et peuvent évoluer.
              Men Matar L Matar ne saurait être tenu responsable des décisions prises sur
              la base de ces informations. Il appartient à l&apos;utilisateur de vérifier
              les informations auprès des sources officielles avant tout achat ou voyage.
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">7. Liens externes</h2>
            <p className="mt-3 text-muted-foreground">
              Le site peut contenir des liens vers des sites tiers (compagnies aériennes,
              agences de visa, etc.). Men Matar L Matar n&apos;est pas responsable du
              contenu de ces sites ni de leur politique de confidentialité.
            </p>
          </article>

          <article>
            <h2 className="text-xl font-black">8. Contact</h2>
            <p className="mt-3 text-muted-foreground">
              Pour toute question relative à ces mentions légales :
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
            </div>
          </article>

        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
