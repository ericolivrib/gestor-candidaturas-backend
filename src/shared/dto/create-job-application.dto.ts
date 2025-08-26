import z from "zod";

export const createJobApplicationSchema = z.object({
  jobTitle: z.string().min(4, 'Vaga deve conter 4 ou mais caracteres'),
  companyName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  url: z.url('URL inválida').optional(),
});

export type CreateJobApplicationDto = z.infer<typeof createJobApplicationSchema>;