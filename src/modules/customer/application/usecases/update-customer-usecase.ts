import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { CustomerOutput } from '../outputs/customer-output.js';
import type { CustomerEntity } from '../../domain/customer-entity.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { UpdateCustomerDto } from '../dtos/update-customer-dto.js';
import type { CustomerRepository } from '../../domain/customer-repository.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { CustomerOutputMapper } from '../outputs/customer-output.js';

export class UpdateCustomerUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly customerRepository: CustomerRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, customerRepository: CustomerRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.customerRepository = customerRepository;
  }

  public async execute(ctx: Context, input: UpdateCustomerDto): Promise<CustomerOutput> {
    const customer: CustomerEntity = await this.customerRepository.get(input.id);

    const before: Record<string, unknown> = customer.toJSON();
    customer.update(input);

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.customerRepository.updateTx(tx, customer);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: customer.id,
        action: AuditLogActionEnum.UPDATE,
        resource: AuditLogResourceEnum.CUSTOMER,
        before,
        after: customer.toJSON(),
      });
    });

    return CustomerOutputMapper.toOutput(customer);
  }
}
