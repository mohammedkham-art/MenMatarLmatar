import Link from 'next/link';

const simulatorBenefits = [
  {
    title: 'Budget estimé',
    meta: 'MAD',
    description: 'Une enveloppe réaliste avant de tomber amoureux du billet.',
  },
  {
    title: 'Programme jour par jour',
    meta: 'J+',
    description: 'Une première structure claire pour visualiser le séjour.',
  },
  {
    title: 'Conseils pratiques',
    meta: 'OK',
    description: 'Visa, rythme, dépenses et petits détails avant de réserver.',
  },
];

export function SimulatorSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid overflow-hidden rounded-2xl border bg-primary text-primary-foreground shadow-2xl shadow-primary/15 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="p-6 md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-foreground/55">
            Simulateur IA
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight md:text-4xl">
            Transforme une envie de départ en plan de voyage lisible.
          </h2>
          <p className="text-primary-foreground/72 mt-4 max-w-2xl text-lg leading-8">
            Budget, durée, style de voyage et passeport marocain : le simulateur
            assemble un premier plan utile avant la réservation.
          </p>

          <div className="mt-8">
            <Link
              href="/simulator"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-black text-accent-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Simuler mon séjour →
            </Link>
          </div>
        </div>

        <div className="border-white/12 border-t bg-black/15 p-5 lg:border-l lg:border-t-0">
          <div className="grid gap-3">
            {simulatorBenefits.map((benefit, index) => (
              <article
                key={benefit.title}
                className="border-white/12 group grid grid-cols-[3.25rem_1fr] gap-4 rounded-xl border bg-white/[0.07] p-4 transition hover:bg-white/[0.11]"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent font-mono text-sm font-black text-accent-foreground shadow-lg shadow-black/10"
                  style={{
                    transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)`,
                  }}
                >
                  {benefit.meta}
                </span>
                <span>
                  <h3 className="font-black">{benefit.title}</h3>
                  <p className="text-primary-foreground/67 mt-1 text-sm leading-6">
                    {benefit.description}
                  </p>
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
