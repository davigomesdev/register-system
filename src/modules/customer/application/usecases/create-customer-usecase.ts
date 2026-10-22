import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { CustomerOutput } from '../outputs/customer-output.js';
import type { CreateCustomerDto } from '../dtos/create-customer-dto.js';
import type { CustomerRepository } from '../../domain/customer-repository.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { CustomerEntity } from '../../domain/customer-entity.js';
import { CustomerOutputMapper } from '../outputs/customer-output.js';

export class CreateCustomerUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly customerRepository: CustomerRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, customerRepository: CustomerRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.customerRepository = customerRepository;
  }

  public async execute(ctx: Context, input: CreateCustomerDto): Promise<CustomerOutput> {
    const customer: CustomerEntity = new CustomerEntity(input);

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.customerRepository.createTx(tx, customer);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: customer.id,
        action: AuditLogActionEnum.CREATE,
        resource: AuditLogResourceEnum.CUSTOMER,
        after: customer.toJSON(),
      });
    });

    return CustomerOutputMapper.toOutput(customer);
  }
}
