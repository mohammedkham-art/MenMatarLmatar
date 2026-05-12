import { NextResponse } from 'next/server';

import { fallbackCountries } from '@/services/countries/fallback-countries';
import { getCountries } from '@/services/countries/get-countries';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const countries = await getCountries().catch(() => fallbackCountries);

    return NextResponse.json({ countries });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Impossible de charger les pays.',
      },
      { status: 500 },
    );
  }
}
