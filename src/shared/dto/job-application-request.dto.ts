import z from "zod";

export const jobApplicationRequestSchema = z.object({
  jobTitle: z.string().min(4, 'Candidatura deve conter 4 ou mais caracteres'),
  companyName: z.string().optional().transform((val) => val ?? null),
  tags: z.array(z.string()).optional().transform((val) => val ?? []),
  url: z.url('URL inválida').optional().transform((val) => val ?? null),
}).required({ jobTitle: true });

export type JobApplicationRequestDto = z.infer<typeof jobApplicationRequestSchema>;