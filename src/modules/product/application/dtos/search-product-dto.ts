import { ProductSort } from '../../domain/product-repository.js';
import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';

import { z } from 'zod';
import { createSearchSchema } from '#src/application/dtos/search-input-dto.js';

export const searchProductSchema = createSearchSchema(
  z.enum(ProductSort),
  z.object({
    search: z
      .string()
      .optional()
      .nullable()
      .transform((v) => v ?? null),
    gender: z
      .enum(ProductGenderEnum)
      .optional()
      .nullable()
      .transform((v) => v ?? null),
  }),
  z.object({}),
);

export type SearchProductDto = z.infer<typeof searchProductSchema>;
