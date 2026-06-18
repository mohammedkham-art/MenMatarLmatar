import { z } from 'zod';

export const createDealSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().max(120).optional(),
  fromAirport: z
    .string()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
  toAirport: z
    .string()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
  fromCity: z.string().min(2).max(80),
  toCity: z.string().min(2).max(80),
  countryCode: z
    .string()
    .min(2)
    .max(2)
    .transform((value) => value.toUpperCase()),
  priceMad: z.coerce.number().int().positive(),
  airline: z.string().max(80).optional(),
  airlineId: z.string().uuid().optional(),
  fareId: z.string().uuid().optional(),
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  bookingUrl: z.string().url(),
  tags: z.string().optional(),
  isActive: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
  isFlash: z.coerce.boolean().default(false),
  score: z.coerce.number().int().min(0).max(100).default(50),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
