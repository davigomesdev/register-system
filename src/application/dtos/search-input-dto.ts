import { z } from 'zod';
import { SortDirection } from '#src/domain/repositories/searchable-repository.js';

export const createSearchSchema = <S extends string, F extends z.ZodType, O extends z.ZodType>(sort: z.ZodType<S>, filter: F, options: O) =>
  z.preprocess(
    (raw: unknown): unknown => (typeof raw === 'object' && raw !== null ? { ...raw, filter: raw, options: raw } : raw),
    z.object({
      page: z.coerce.number().int().min(1).optional(),
      perPage: z.coerce.number().int().min(1).max(50).optional(),
      sort: sort.optional(),
      sortDir: z.enum(SortDirection).optional(),
      filter,
      options,
    }),
  );
