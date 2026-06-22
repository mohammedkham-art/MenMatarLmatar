import type { Metadata } from 'next';

import { ContactForm } from '@/app/(public)/contact/contact-form';
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';

export const metadata: Metadata = {
  description:
    "Contacte l'équipe Men Matar L Matar pour une question, suggestion ou partenariat.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">Nous contacter</h1>
          <p className="mt-3 text-muted-foreground">
            Une question, une suggestion ou un partenariat ? Écrivez-nous.
          </p>
        </header>

        <div className="mt-10 max-w-xl">
          <ContactForm />
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
