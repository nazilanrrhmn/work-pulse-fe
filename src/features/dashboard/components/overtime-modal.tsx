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

// ── Constants ──
const ACTIVITY_MIN_LENGTH = 5;
const ACTIVITY_MAX_LENGTH = 500;

// ── Validation schema ──
const overtimeSchema = z.object({
  overtimeActivity: z
    .string()
    .min(
      ACTIVITY_MIN_LENGTH,
      `Deskripsi kegiatan minimal ${ACTIVITY_MIN_LENGTH} karakter`,
    )
    .max(
      ACTIVITY_MAX_LENGTH,
      `Deskripsi kegiatan maksimal ${ACTIVITY_MAX_LENGTH} karakter`,
    ),
});

export type OvertimeFormValues = z.infer<typeof overtimeSchema>;

interface OvertimeModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (data: OvertimeFormValues) => void;
}

const DEFAULT_VALUES: OvertimeFormValues = {
  overtimeActivity: "",
};

// ── Header ──
function ModalHeader() {
  return (
    <div className="mb-5 flex items-center gap-2.5">
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
  );
}

// ── Modal ──
export default function OvertimeModal({
  open,
  onOpenChange,
  onSubmit,
}: OvertimeModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<OvertimeFormValues>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const handleFormSubmit = (values: OvertimeFormValues) => {
    onSubmit(values);
    reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogClose />
          <ModalHeader />

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="overtimeActivity"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Deskripsi Kegiatan Lembur
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder="Jelaskan kegiatan yang dilakukan selama lembur..."
                    rows={4}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

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
