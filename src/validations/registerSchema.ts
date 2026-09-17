import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/,
      {
        message: "Email must be a valid email",
      },
    ),
  npp: z.string().length(6, "NPP must be exactly 6 characters"),
  phone: z.string().min(10, "No HP must be at least 10 character"),
  password: z.string().min(6, "Password must be at least 6 character"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
