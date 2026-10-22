import type { CustomerOutput } from '../outputs/customer-output.js';
import type { CustomerEntity } from '../../domain/customer-entity.js';
import type { CustomerRepository } from '../../domain/customer-repository.js';
import type { GetCustomerParamsDto } from '../dtos/get-customer-dto.js';

import { CustomerOutputMapper } from '../outputs/customer-output.js';

export class GetCustomerUsecase {
  private readonly customerRepository: CustomerRepository;

  public constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  public async execute(input: GetCustomerParamsDto): Promise<CustomerOutput> {
    const customer: CustomerEntity = await this.customerRepository.get(input.id);
    return CustomerOutputMapper.toOutput(customer);
  }
}
