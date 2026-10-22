import type { CustomerEntity } from '../../domain/customer-entity.js';

export type CustomerOutput = {
  id: string;
  name: string;
  cpfCnpj: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class CustomerOutputMapper {
  public static toOutput(customer: CustomerEntity): CustomerOutput {
    return {
      id: customer.id.toString(),
      name: customer.name,
      cpfCnpj: customer.cpfCnpj,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
