import z from "zod";

export const jobApplicationStatusSchema = z.object({
  status: z.enum(
    ['DRAFT', 'APPLIED', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN', 'ARCHIVED'],
    'Status inválido'
  ),
});

export type JobApplicationStatusDto = z.infer<typeof jobApplicationStatusSchema>;