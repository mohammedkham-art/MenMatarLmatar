import { NextResponse } from 'next/server';

import { getAvailableDealMonths } from '@/services/deals/get-available-deal-months';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const months = await getAvailableDealMonths();

    return NextResponse.json({ months });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Impossible de charger les mois disponibles.',
      },
      { status: 500 },
    );
  }
}
