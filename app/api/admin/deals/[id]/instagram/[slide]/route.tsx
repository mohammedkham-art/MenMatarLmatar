import { ImageResponse } from 'next/og';
import { type NextRequest, NextResponse } from 'next/server';

import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/auth/admin-session';
import { getAdminDeal } from '@/services/deals/get-admin-deal';
import {
  getInstagramSlideElement,
  getInstagramSlideFilename,
  type InstagramSlide,
} from '@/services/social/instagram-visual';

export const runtime = 'nodejs';

const imageSize = {
  height: 1350,
  width: 1080,
};

const validSlides = new Set<InstagramSlide>(['outbound', 'return', 'cta']);

type RouteContext = {
  params: Promise<{
    id: string;
    slide: string;
  }>;
};

async function isAdminRequest(request: NextRequest) {
  return verifyAdminSessionToken(
    request.cookies.get(adminSessionCookieName)?.value,
    process.env.ADMIN_PASSWORD,
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, slide } = await context.params;

  if (!validSlides.has(slide as InstagramSlide)) {
    return NextResponse.json({ error: 'Invalid slide' }, { status: 400 });
  }

  const deal = await getAdminDeal(id);

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  return new ImageResponse(
    getInstagramSlideElement(deal, slide as InstagramSlide),
    {
      ...imageSize,
      headers: {
        'Content-Disposition': `inline; filename="${getInstagramSlideFilename(
          deal,
          slide as InstagramSlide,
        )}"`,
      },
    },
  );
}
