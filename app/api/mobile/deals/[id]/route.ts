import { NextResponse } from 'next/server';

import { getAdminDeal } from '@/services/deals/get-admin-deal';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deal = await getAdminDeal(id);

    if (!deal || !deal.isActive) {
      return NextResponse.json(
        { error: 'Deal introuvable.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ deal });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur.' },
      { status: 500 },
    );
  }
}
