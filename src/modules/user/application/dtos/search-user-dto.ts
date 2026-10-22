import { UserSort } from '../../domain/user-repository.js';
import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

import { z } from 'zod';
import { createSearchSchema } from '#src/application/dtos/search-input-dto.js';

export const searchUserSchema = createSearchSchema(
  z.enum(UserSort),
  z.object({
    search: z.string().optional().nullable().transform((v) => v ?? null),
    type: z.enum(UserTypeEnum).optional().nullable().transform((v) => v ?? null),
    status: z.enum(UserStatusEnum).optional().nullable().transform((v) => v ?? null),
  }),
  z.object({}),
);

export type SearchUserDto = z.infer<typeof searchUserSchema>;
