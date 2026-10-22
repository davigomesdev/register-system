import { z } from 'zod';

export const updateMePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8, 'password must be at least 8 characters long'),
});

export type UpdateMePasswordDto = z.infer<typeof updateMePasswordSchema>;
