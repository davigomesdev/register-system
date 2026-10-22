import { SessionSort } from '../../domain/session-repository.js';

import { z } from 'zod';
import { createSearchSchema } from '#src/application/dtos/search-input-dto.js';

export const searchMeSessionSchema = createSearchSchema(
  z.enum(SessionSort),
  z.object({
    familyId: z.coerce.bigint().optional(),
    activeOnly: z
      .enum(['true', 'false'])
      .transform((value: string): boolean => value === 'true')
      .optional(),
  }),
  z.object({}),
);

export type SearchMeSessionDto = z.infer<typeof searchMeSessionSchema>;
