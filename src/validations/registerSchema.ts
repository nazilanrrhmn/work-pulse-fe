import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(4, "Username must be at least 4 characters"),
  email: z.string().email("Email must be a valid email"),
  npp: z.number().min(6, "NPP must be at least 6 character"),
  phone: z.string().min(10, "No HP must be at least 10 character"),
  password: z.string().min(6, "Password must be at least 6 character"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
