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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { LogOut } from "lucide-react";

// ── Constants ──
const DESCRIPTION_MIN_LENGTH = 5;
const DESCRIPTION_MAX_LENGTH = 500;

// ── Validation schema ──
const checkoutSchema = z.object({
  projectName: z.string().min(1, "Nama project harus diisi"),
  activityDescription: z
    .string()
    .min(
      DESCRIPTION_MIN_LENGTH,
      `Deskripsi aktivitas minimal ${DESCRIPTION_MIN_LENGTH} karakter`,
    )
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Deskripsi aktivitas maksimal ${DESCRIPTION_MAX_LENGTH} karakter`,
    ),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export interface CheckoutData extends CheckoutFormValues {
  readonly checkOutTime: Date;
}

interface CheckoutModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (data: CheckoutData) => void;
}

const DEFAULT_VALUES: CheckoutFormValues = {
  projectName: "",
  activityDescription: "",
};

// ── Header ──
function ModalHeader() {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <LogOut className="size-5" />
      </div>
      <div>
        <DialogTitle>Check-out</DialogTitle>
        <DialogDescription>
          Catat kegiatan Anda sebelum pulang
        </DialogDescription>
      </div>
    </div>
  );
}

// ── Modal ──
export default function CheckoutModal({
  open,
  onOpenChange,
  onSubmit,
}: CheckoutModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const handleFormSubmit = (values: CheckoutFormValues) => {
    onSubmit({ ...values, checkOutTime: new Date() });
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
            {/* Project Name */}
            <Controller
              name="projectName"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Nama Project</FieldLabel>
                  <Input
                    id={field.name}
                    placeholder="Masukkan nama project..."
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* Activity Description */}
            <Controller
              name="activityDescription"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Deskripsi Kegiatan
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder="Jelaskan kegiatan yang dilakukan hari ini..."
                    rows={4}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

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
                {isSubmitting ? "Menyimpan..." : "Checkout"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
