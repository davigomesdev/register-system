import { AuditLogSort } from '../../domain/audit-log-repository.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { z } from 'zod';
import { createSearchSchema } from '#src/application/dtos/search-input-dto.js';

export const searchInputAuditLogSchema = createSearchSchema(
  z.enum(AuditLogSort),
  z.object({
    actorId: z.coerce.bigint().optional(),
    resourceId: z.coerce.bigint().optional(),
    action: z.enum(AuditLogActionEnum).optional(),
    resource: z.enum(AuditLogResourceEnum).optional(),
  }),
  z.object({
    actor: z
      .enum(['true', 'false'])
      .transform((value: string): boolean => value === 'true')
      .optional(),
  }),
);

export type SearchInputAuditLogDto = z.infer<typeof searchInputAuditLogSchema>;
