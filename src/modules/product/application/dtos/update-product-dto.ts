import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';

import { z } from 'zod';
import { Decimal } from 'decimal.js';

export const updateProductParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export const updateProductBodySchema = z.object({
  sku: z.string().min(1, 'sku is required').max(60),
  name: z.string().min(1, 'name is required').max(255),
  slug: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  costPrice: z
    .union([z.string(), z.number()])
    .transform((v) => new Decimal(v))
    .refine((v) => v.isFinite() && !v.isNegative(), 'costPrice must be greater than or equal to 0')
    .refine((v) => v.decimalPlaces() <= 4, 'costPrice must have at most 4 decimal places'),
  gender: z.enum(ProductGenderEnum),
});

export type UpdateProductDto = z.infer<typeof updateProductParamsSchema> & z.infer<typeof updateProductBodySchema>;
