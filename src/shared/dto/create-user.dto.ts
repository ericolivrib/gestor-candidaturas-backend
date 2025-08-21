import z from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().min(2, 'Nome deve conter 2 ou mais caracteres'),
    email: z.email('E-mail inválido'),
    password: z.string().min(8, 'Senha deve conter 8 ou mais caracteres'),
  })
  .required();

export type CreateUserDto = z.infer<typeof createUserSchema>;
