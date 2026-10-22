import { z } from 'zod';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { isValidPhoneNumber } from 'libphonenumber-js';

export const updateMeSchema = z.object({
  name: z.string().min(1, 'name is required'),
  cpfCnpj: z
    .string()
    .regex(/^\d+$/, 'cpfCnpj must contain only digits')
    .refine((value) => cpf.isValid(value) || cnpj.isValid(value), 'invalid CPF or CNPJ')
    .nullable()
    .optional(),
  email: z.email('invalid email address'),
  phone: z.string().refine((value) => isValidPhoneNumber(value, 'BR'), 'invalid phone number'),
});

export type UpdateMeDto = z.infer<typeof updateMeSchema>;
