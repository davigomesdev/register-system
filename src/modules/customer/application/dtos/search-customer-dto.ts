import { CustomerSort } from '../../domain/customer-repository.js';

import { z } from 'zod';
import { createSearchSchema } from '#src/application/dtos/search-input-dto.js';

export const searchCustomerSchema = createSearchSchema(
  z.enum(CustomerSort),
  z.object({
    search: z
      .string()
      .optional()
      .nullable()
      .transform((v) => v ?? null),
  }),
  z.object({}),
);

export type SearchCustomerDto = z.infer<typeof searchCustomerSchema>;
