import z from 'zod';

export const jwtResponse = z.object({
  token: z.string(),
  expiresIn: z.number(),
});

export type JwtResponseDto = z.infer<typeof jwtResponse>;
