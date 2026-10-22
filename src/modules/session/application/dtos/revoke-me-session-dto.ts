import { z } from 'zod';

export const revokeMeSessionParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export type RevokeMeSessionParamsDto = z.infer<typeof revokeMeSessionParamsSchema>;
