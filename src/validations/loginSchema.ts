import { z } from "zod";

export const loginSchema = z.object({
  npp: z.string().length(6, "NPP must be exactly 6 characters"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
