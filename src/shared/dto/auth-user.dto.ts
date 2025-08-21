import z from 'zod';

export const authUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
});

export type AuthUserDto = z.infer<typeof authUserSchema>;
