import { z } from 'zod';

export const getUserParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export type GetUserParamsDto = z.infer<typeof getUserParamsSchema>;
