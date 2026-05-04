import Link from 'next/link';

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/menmatarlmatar',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 3.25A4.75 4.75 0 1 1 7.25 12 4.75 4.75 0 0 1 12 7.25Zm0 2A2.75 2.75 0 1 0 14.75 12 2.75 2.75 0 0 0 12 9.25Zm5.25-2.55a1.05 1.05 0 1 1-1.05 1.05 1.05 1.05 0 0 1 1.05-1.05Z"
        />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@menmatarlmatar',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M14.75 2h2.2a5.55 5.55 0 0 0 4.25 4.88v2.28a7.45 7.45 0 0 1-4.05-1.2v7.02A6.02 6.02 0 1 1 11.13 9v2.34a3.73 3.73 0 1 0 3.62 3.72V2Z"
        />
      </svg>
    ),
  },
];

export function PublicFooter() {
  return (
    <footer className="bg-background/92 border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="max-w-xl">
          <p className="text-sm font-black text-primary">Men Matar L Matar</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Destinations, visas et bons plans pour voyageurs marocains.
          </p>

          <div className="mt-4 flex items-center gap-3">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted"
              >
                {link.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
