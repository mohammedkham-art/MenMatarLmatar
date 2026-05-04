import Link from 'next/link';

type AdminHeaderActionsProps = {
  links?: Array<{
    href: string;
    label: string;
  }>;
};

export function AdminHeaderActions({ links = [] }: AdminHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-primary">
          {link.label}
        </Link>
      ))}
      <Link href="/" className="text-primary">
        Retour au site
      </Link>
      <Link
        href="/admin/logout"
        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-red-700 transition hover:bg-red-100"
      >
        Déconnexion
      </Link>
    </div>
  );
}
