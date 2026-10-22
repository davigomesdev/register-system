import { z } from 'zod';

export const getMeSessionParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export type GetMeSessionParamsDto = z.infer<typeof getMeSessionParamsSchema>;
