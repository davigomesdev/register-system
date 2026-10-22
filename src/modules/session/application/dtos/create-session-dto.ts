import { z } from 'zod';

export const createSessionSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
