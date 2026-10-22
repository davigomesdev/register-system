import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';

import { z } from 'zod';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { isValidPhoneNumber } from 'libphonenumber-js';

export const updateUserParamsSchema = z.object({
  id: z.coerce.bigint(),
});

export const updateUserBodySchema = z.object({
  name: z.string().min(1, 'name is required'),
  cpfCnpj: z
    .string()
    .regex(/^\d+$/, 'cpfCnpj must contain only digits')
    .refine((value) => cpf.isValid(value) || cnpj.isValid(value), 'invalid CPF or CNPJ')
    .nullable()
    .optional(),
  email: z.email('invalid email address'),
  phone: z.string().refine((value) => isValidPhoneNumber(value, 'BR'), 'invalid phone number'),
  type: z.enum(UserTypeEnum),
});

export type UpdateUserDto = z.infer<typeof updateUserParamsSchema> & z.infer<typeof updateUserBodySchema>;
