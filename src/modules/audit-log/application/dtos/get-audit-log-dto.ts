import { z } from 'zod';

export const getAuditLogParamsSchema = z.object({
  id: z.coerce.bigint().positive().max(9223372036854775807n),
});

export const getAuditLogQuerySchema = z.object({
  actor: z
    .enum(['true', 'false'], {
      error: 'actor must be true or false',
    })
    .transform((value: string): boolean => value === 'true')
    .optional(),
});

export type GetAuditLogDto = z.infer<typeof getAuditLogParamsSchema> & z.infer<typeof getAuditLogQuerySchema>;
