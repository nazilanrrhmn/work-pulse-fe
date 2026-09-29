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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Clock } from "lucide-react";

const overtimeSchema = z.object({
  overtimeActivity: z
    .string()
    .min(5, "Deskripsi kegiatan minimal 5 karakter")
    .max(500, "Deskripsi kegiatan maksimal 500 karakter"),
});

export type OvertimeFormValues = z.infer<typeof overtimeSchema>;

interface OvertimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OvertimeFormValues) => void;
}

export default function OvertimeModal({
  open,
  onOpenChange,
  onSubmit,
}: OvertimeModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OvertimeFormValues>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: {
      overtimeActivity: "",
    },
  });

  const handleFormSubmit = (values: OvertimeFormValues) => {
    onSubmit(values);
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
          
          <div className="mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Clock className="size-5" />
              </div>
              <div>
                <DialogTitle>Selesai Lembur</DialogTitle>
                <DialogDescription>
                  Catat kegiatan lembur Anda hari ini
                </DialogDescription>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="overtimeActivity">
                Deskripsi Kegiatan Lembur
              </FieldLabel>
              <Controller
                name="overtimeActivity"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="overtimeActivity"
                    placeholder="Jelaskan kegiatan yang dilakukan selama lembur..."
                    rows={4}
                    aria-invalid={!!errors.overtimeActivity}
                    {...field}
                  />
                )}
              />
              <FieldError>{errors.overtimeActivity?.message}</FieldError>
            </Field>

            <div className="mt-1 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Selesai"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
