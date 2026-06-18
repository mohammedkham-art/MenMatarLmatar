import { z } from 'zod';

export const expoPushTokenSchema = z
  .string()
  .regex(/^ExponentPushToken\[[A-Za-z0-9_-]+\]$/);

export const registerPushSchema = z.object({
  expoPushToken: expoPushTokenSchema,
  platform: z.enum(['ios', 'android']),
  appVersion: z.string().max(32).optional(),
  notifyCheapDeals: z.boolean().optional(),
  notifyFlashDeals: z.boolean().optional(),
});

export const unregisterPushSchema = z.object({
  expoPushToken: expoPushTokenSchema,
});

export const preferencesPushSchema = z.object({
  expoPushToken: expoPushTokenSchema,
  notifyCheapDeals: z.boolean().optional(),
  notifyFlashDeals: z.boolean().optional(),
});
