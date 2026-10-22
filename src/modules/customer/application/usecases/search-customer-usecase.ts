import type { SearchCustomerDto } from '../dtos/search-customer-dto.js';
import type { CustomerRepository, CustomerSearchResult } from '../../domain/customer-repository.js';

import { CustomerSearchParams } from '../../domain/customer-repository.js';

export class SearchCustomerUsecase {
  private readonly customerRepository: CustomerRepository;

  public constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  public async execute(input: SearchCustomerDto): Promise<CustomerSearchResult> {
    return this.customerRepository.search(new CustomerSearchParams(input));
  }
}
