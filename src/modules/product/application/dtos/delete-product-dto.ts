import { z } from 'zod';

export const deleteProductParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export type DeleteProductParamsDto = z.infer<typeof deleteProductParamsSchema>;
