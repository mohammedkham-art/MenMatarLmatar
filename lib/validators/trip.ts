import { z } from 'zod';

export const tripStatusSchema = z.enum(['draft', 'planned', 'completed']);

export const tripSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().uuid(),
  destination: z.string().min(1).max(120),
  status: tripStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TripSchema = z.infer<typeof tripSchema>;
