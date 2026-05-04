import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';

type DashboardShellProps = {
  children: ReactNode;
};

const navigation = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/trips', label: 'Trips' },
  { href: '/dashboard/settings', label: 'Settings' },
] as const;

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/images/logo.png"
              alt="Men Matar L Matar"
              width={72}
              height={72}
              className="h-12 w-12 object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
