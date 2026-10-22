import type { IJwtService } from '#src/infra/jwt/jwt-service.js';
import type { CustomerRepository } from '../domain/customer-repository.js';
import type { FastifyInstance } from 'fastify';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';

import { createCustomerSchema } from '../application/dtos/create-customer-dto.js';
import { getCustomerParamsSchema } from '../application/dtos/get-customer-dto.js';
import { searchCustomerSchema } from '../application/dtos/search-customer-dto.js';
import { updateCustomerParamsSchema, updateCustomerBodySchema } from '../application/dtos/update-customer-dto.js';
import { deleteCustomerParamsSchema } from '../application/dtos/delete-customer-dto.js';

import { JwtGuard } from '#src/adapters/middlewares/jwt-guard.js';
import { CustomerController } from './customer-controller.js';

import { CreateCustomerUsecase } from '../application/usecases/create-customer-usecase.js';
import { GetCustomerUsecase } from '../application/usecases/get-customer-usecase.js';
import { SearchCustomerUsecase } from '../application/usecases/search-customer-usecase.js';
import { UpdateCustomerUsecase } from '../application/usecases/update-customer-usecase.js';
import { DeleteCustomerUsecase } from '../application/usecases/delete-customer-usecase.js';

export class CustomerRoutes {
  public static register(
    app: FastifyInstance,
    jwtService: IJwtService,
    persistenceService: IPersistenceService,
    auditLogProvider: AuditLogProvider,
    customerRepository: CustomerRepository,
  ): void {
    const createCustomerUsecase: CreateCustomerUsecase = new CreateCustomerUsecase(persistenceService, auditLogProvider, customerRepository);
    const getCustomerUsecase: GetCustomerUsecase = new GetCustomerUsecase(customerRepository);
    const searchCustomerUsecase: SearchCustomerUsecase = new SearchCustomerUsecase(customerRepository);
    const updateCustomerUsecase: UpdateCustomerUsecase = new UpdateCustomerUsecase(persistenceService, auditLogProvider, customerRepository);
    const deleteCustomerUsecase: DeleteCustomerUsecase = new DeleteCustomerUsecase(persistenceService, auditLogProvider, customerRepository);

    const customerController: CustomerController = new CustomerController(
      createCustomerUsecase,
      getCustomerUsecase,
      searchCustomerUsecase,
      updateCustomerUsecase,
      deleteCustomerUsecase,
    );

    app.register(
      async (api: FastifyInstance): Promise<void> => {
        api.addHook('onRequest', new JwtGuard(jwtService, SubjectTypeEnum.USER).handle);

        api.get('', { schema: { querystring: searchCustomerSchema } }, customerController.search.bind(customerController));
        api.get('/:id', { schema: { params: getCustomerParamsSchema } }, customerController.get.bind(customerController));
        api.post('', { schema: { body: createCustomerSchema } }, customerController.create.bind(customerController));
        api.put('/:id', { schema: { params: updateCustomerParamsSchema, body: updateCustomerBodySchema } }, customerController.update.bind(customerController));
        api.delete('/:id', { schema: { params: deleteCustomerParamsSchema } }, customerController.delete.bind(customerController));
      },
      { prefix: '/customers' },
    );
  }
}
