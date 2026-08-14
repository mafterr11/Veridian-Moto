import { z } from "zod";

import { configurationStateSchema } from "@/domain/enquiries/schemas";

export const offerRequestSchema = z.object({
  modelSlug: z
    .string()
    .min(1)
    .max(140)
    .regex(/^[A-Za-z0-9-]+$/),
  state: configurationStateSchema,
});

export type OfferRequest = z.infer<typeof offerRequestSchema>;

/** Mirrors the configurator action's guard on serialized configuration size. */
export const MAX_OFFER_REQUEST_BYTES = 50_000;
