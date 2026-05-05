import { NextResponse } from 'next/server';

import { getDeals } from '@/services/deals/get-deals';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const deals = await getDeals();

    return NextResponse.json({ deals });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Impossible de charger les deals.',
      },
      { status: 500 },
    );
  }
}
