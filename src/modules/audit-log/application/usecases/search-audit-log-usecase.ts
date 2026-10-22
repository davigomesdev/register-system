import type { SearchInputAuditLogDto } from '../dtos/search-audit-log-dto.js';
import type { AuditLogRepository, AuditLogSearchResult } from '../../domain/audit-log-repository.js';

import { AuditLogSearchParams } from '../../domain/audit-log-repository.js';

export class SearchAuditLogUsecase {
  private readonly auditLogRepository: AuditLogRepository;

  public constructor(auditLogRepository: AuditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  public async execute(input: SearchInputAuditLogDto): Promise<AuditLogSearchResult> {
    const params: AuditLogSearchParams = new AuditLogSearchParams(input);
    return this.auditLogRepository.search(params);
  }
}
