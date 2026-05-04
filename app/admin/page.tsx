import Link from 'next/link';

import { AdminHeaderActions } from '@/components/shared/admin-header-actions';

const adminSections = [
  {
    title: 'Destinations',
    description: 'Pays, type de visa, notes, sources et mises en avant.',
    href: '/admin/destinations',
    cta: 'Gérer les destinations',
  },
  {
    title: 'Offres',
    description: 'Deals de vols, prix MAD, liens de réservation et visibilité.',
    href: '/admin/deals',
    cta: 'Gérer les offres',
  },
];

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Centre de contrôle
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Accède rapidement aux espaces de gestion du SaaS.
          </p>
        </div>

        <AdminHeaderActions />
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {adminSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl border bg-muted/40 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <h2 className="text-2xl font-bold tracking-tight">
              {section.title}
            </h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
              {section.description}
            </p>
            <span className="mt-6 inline-flex text-sm font-bold text-primary transition group-hover:translate-x-1">
              {section.cta} →
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
