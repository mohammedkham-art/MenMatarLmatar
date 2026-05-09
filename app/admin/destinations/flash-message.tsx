'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type FlashMessageProps = {
  message: string;
  type: 'success' | 'error';
  redirectTo?: string;
};

export function FlashMessage({ message, type, redirectTo = '/admin/destinations' }: FlashMessageProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(redirectTo);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, redirectTo]);

  const className =
    type === 'success'
      ? 'mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700'
      : 'mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700';

  return <div className={className}>{message}</div>;
}
