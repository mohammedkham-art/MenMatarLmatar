import { type NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { tripSimulationRequestSchema } from '@/lib/validators/simulator';
import {
  generateTripPlan,
  TripPlanGenerationError,
} from '@/services/ai/client';
import {
  checkRateLimit,
  type RateLimitResult,
} from '@/services/security/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const simulatorRateLimit = {
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    'unknown'
  );
}

function getRateLimitHeaders(result: RateLimitResult) {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(
    `simulator:${getClientIp(request)}`,
    simulatorRateLimit,
  );
  const rateLimitHeaders = getRateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          'Trop de simulations ont ete lancees depuis cette connexion. Reessaie un peu plus tard.',
        code: 'rate_limited',
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as unknown;
    const params = tripSimulationRequestSchema.parse(body);
    const plan = await generateTripPlan(params);

    return NextResponse.json({ plan }, { headers: rateLimitHeaders });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Les informations envoyées sont invalides.',
          code: 'invalid_request',
          details: error.flatten(),
        },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    if (error instanceof TripPlanGenerationError) {
      return NextResponse.json(
        {
          error: error.publicMessage,
          code: error.code,
        },
        { status: error.status, headers: rateLimitHeaders },
      );
    }

    return NextResponse.json(
      {
        error: 'Impossible de générer le voyage pour le moment.',
        code: 'unexpected_error',
      },
      { status: 500, headers: rateLimitHeaders },
    );
  }
}
