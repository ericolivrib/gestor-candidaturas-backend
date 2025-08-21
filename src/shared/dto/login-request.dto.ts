import z from 'zod';

export const loginSchema = z
  .object({
    email: z.string().min(1, 'E-mail é obrigatório'),
    password: z.string().min(1, 'Senha é obrigatória'),
  })
  .required();

export type LoginRequest = z.infer<typeof loginSchema>;
