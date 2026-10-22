import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

import { z } from 'zod';

export const updateStatusUserParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export const updateStatusUserBodySchema = z.object({
  status: z.enum(UserStatusEnum),
});

export type UpdateStatusUserDto = z.infer<typeof updateStatusUserParamsSchema> & z.infer<typeof updateStatusUserBodySchema>;
