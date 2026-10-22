import type { GetAuditLogDto } from '../dtos/get-audit-log-dto.js';
import type { AuditLogOutput } from '../outputs/audit-log-output.js';
import type { AuditLogEntity } from '../../domain/audit-log-entity.js';
import type { AuditLogRepository } from '../../domain/audit-log-repository.js';

import { AuditLogOutputMapper } from '../outputs/audit-log-output.js';

export class GetAuditLogUsecase {
  private readonly auditLogRepository: AuditLogRepository;

  public constructor(auditLogRepository: AuditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  public async execute(input: GetAuditLogDto): Promise<AuditLogOutput> {
    const auditLog: AuditLogEntity = await this.auditLogRepository.get(input.id, { ...input });
    return AuditLogOutputMapper.toOutput(auditLog);
  }
}
