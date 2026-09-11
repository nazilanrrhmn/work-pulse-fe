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

// ── Validation schema ──
const checkoutSchema = z.object({
  projectName: z.string().min(1, "Nama project harus diisi"),
  activityDescription: z
    .string()
    .min(5, "Deskripsi aktivitas minimal 5 karakter")
    .max(500, "Deskripsi aktivitas maksimal 500 karakter"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export interface CheckoutData extends CheckoutFormValues {
  checkOutTime: Date;
}

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CheckoutData) => void;
}

export default function CheckoutModal({
  open,
  onOpenChange,
  onSubmit,
}: CheckoutModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      projectName: "",
      activityDescription: "",
    },
  });

  const handleFormSubmit = (values: CheckoutFormValues) => {
    onSubmit({
      ...values,
      checkOutTime: new Date(),
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
                <LogOut className="size-5" />
              </div>
              <div>
                <DialogTitle>Check-out</DialogTitle>
                <DialogDescription>
                  Catat kegiatan Anda sebelum pulang
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Project Name */}
            <Field>
              <FieldLabel htmlFor="projectName">Nama Project</FieldLabel>
              <Controller
                name="projectName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="projectName"
                    placeholder="Masukkan nama project..."
                    aria-invalid={!!errors.projectName}
                    {...field}
                  />
                )}
              />
              <FieldError>{errors.projectName?.message}</FieldError>
            </Field>

            {/* Activity Description */}
            <Field>
              <FieldLabel htmlFor="activityDescription">
                Deskripsi Kegiatan
              </FieldLabel>
              <Controller
                name="activityDescription"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="activityDescription"
                    placeholder="Jelaskan kegiatan yang dilakukan hari ini..."
                    rows={4}
                    aria-invalid={!!errors.activityDescription}
                    {...field}
                  />
                )}
              />
              <FieldError>{errors.activityDescription?.message}</FieldError>
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
                {isSubmitting ? "Menyimpan..." : "Checkout"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
