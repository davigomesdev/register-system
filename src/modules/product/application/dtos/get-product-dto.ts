import { z } from 'zod';

export const getProductParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export type GetProductParamsDto = z.infer<typeof getProductParamsSchema>;
