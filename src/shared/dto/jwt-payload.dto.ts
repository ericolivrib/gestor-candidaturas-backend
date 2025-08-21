import z from 'zod';

export const jwtPayloadSchema = z.object({
  iss: z.string(),
  jti: z.uuid(),
  sub: z.uuid(),
});

export type JwtPayloadDto = z.infer<typeof jwtPayloadSchema>;
