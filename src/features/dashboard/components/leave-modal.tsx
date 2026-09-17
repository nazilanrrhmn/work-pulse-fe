import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DialogRoot,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList } from "lucide-react";

const leaveSchema = z.object({
  type: z.enum(["CUTI", "IZIN", "SAKIT"], {
    required_error: "Pilih jenis izin",
  }),
  projectName: z.string().min(1, "Nama project harus diisi"),
});

export type LeaveFormValues = z.infer<typeof leaveSchema>;

export interface LeaveData extends LeaveFormValues {
  date: string; // YYYY-MM-DD
}

interface LeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeaveData) => void;
}

export default function LeaveModal({
  open,
  onOpenChange,
  onSubmit,
}: LeaveModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: undefined,
      projectName: "",
    },
  });

  const handleFormSubmit = (values: LeaveFormValues) => {
    // Generate today's date in YYYY-MM-DD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    onSubmit({
      ...values,
      date: dateStr,
    });
    reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogClose />

          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <DialogTitle>Pengajuan Izin / Cuti</DialogTitle>
                <DialogDescription>
                  Isi form di bawah untuk pengajuan absen.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Leave Type */}
            <Field>
              <FieldLabel htmlFor="type">Jenis Izin</FieldLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="type" aria-invalid={!!errors.type}>
                      <SelectValue placeholder="Pilih jenis izin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUTI">Cuti</SelectItem>
                      <SelectItem value="IZIN">Izin</SelectItem>
                      <SelectItem value="SAKIT">Sakit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.type?.message}</FieldError>
            </Field>

            {/* Project Name */}
            <Field>
              <FieldLabel htmlFor="projectName">Nama Project</FieldLabel>
              <Controller
                name="projectName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="projectName"
                    placeholder="Masukkan nama project saat ini..."
                    aria-invalid={!!errors.projectName}
                    {...field}
                  />
                )}
              />
              <FieldError>{errors.projectName?.message}</FieldError>
            </Field>

            {/* Actions */}
            <div className="mt-1 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
