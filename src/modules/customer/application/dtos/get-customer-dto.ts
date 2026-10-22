import { z } from 'zod';

export const getCustomerParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export type GetCustomerParamsDto = z.infer<typeof getCustomerParamsSchema>;
