import { z } from "zod";

export const exampleBodySchema = z
  .object({
    message: z.string().trim().min(1).max(200),
  })
  .strict();
