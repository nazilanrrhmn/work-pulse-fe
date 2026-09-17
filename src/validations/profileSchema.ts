import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z
    .string()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/,
      {
        message: "Email must be a valid email",
      },
    ),
  noHp: z
    .string()
    .min(8, "No. HP minimal 8 karakter")
    .regex(/^[\d+\-\s()]+$/, "Format no. HP tidak valid"),
  npp: z.string().min(1, "NPP tidak boleh kosong"),
  nppBni: z.number().min(1, "NPP BNI tidak boleh kosong"),
  manager: z.string().min(1, "Manager tidak boleh kosong"),
  departemenHead: z.string().min(1, "Departemen Head tidak boleh kosong"),
  divisi: z.string().min(1, "Divisi tidak boleh kosong"),
  departemen: z.string().min(1, "Departemen tidak boleh kosong"),
  kelompok: z.string().min(1, "Kelompok tidak boleh kosong"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
