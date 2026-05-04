import { z } from 'zod';

export const countryAdminSchema = z.object({
  name: z.string().min(2).max(120),
  code: z
    .string()
    .min(2)
    .max(2)
    .transform((value) => value.toUpperCase()),
  region: z.string().min(2).max(80),
  visaType: z.enum(['visa_free', 'evisa', 'on_arrival', 'visa_required']),
  maxStayDays: z
    .union([z.literal(''), z.coerce.number().int().positive()])
    .optional(),
  notes: z.string().max(800).optional(),
  officialSourceUrl: z.union([z.literal(''), z.string().url()]).optional(),
  isFeatured: z.coerce.boolean().default(false),
});

export type CountryAdminInput = z.infer<typeof countryAdminSchema>;
