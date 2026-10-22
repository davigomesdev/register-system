import { z } from 'zod';

export const deleteCustomerParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export type DeleteCustomerParamsDto = z.infer<typeof deleteCustomerParamsSchema>;
