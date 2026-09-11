import { useState } from "react";
import { useAppSelector } from "@/hooks/use-store";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Pencil,
  Check,
  X,
  Phone,
  Mail,
  BadgeCheck,
  Hash,
  Clock,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "cn";

// ── Constants ─────────────────────────────────────────────────────────────────
const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
const LS_KEY = "wp_sensitive_fields_last_changed";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLastChanged(): Date | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function saveLastChanged() {
  try {
    localStorage.setItem(LS_KEY, new Date().toISOString());
  } catch {}
}

/** Returns remaining cooldown as a formatted string, or null if cooldown is over. */
function getRemainingCooldown(lastChanged: Date | null): string | null {
  if (!lastChanged) return null;
  const elapsed = Date.now() - lastChanged.getTime();
  if (elapsed >= COOLDOWN_MS) return null;

  const remainMs = COOLDOWN_MS - elapsed;
  const days = Math.floor(remainMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} hari ${hours} jam lagi`;
  if (hours > 0) return `${hours} jam ${mins} menit lagi`;
  return `${mins} menit lagi`;
}

// ── Validation ────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  noHp: z
    .string()
    .min(8, "No. HP minimal 8 karakter")
    .regex(/^[\d+\-\s()]+$/, "Format no. HP tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter").regex(/^\S+$/, "Username tidak boleh mengandung spasi"),
  npp: z.string().min(1, "NPP tidak boleh kosong"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <div className="flex size-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-md">
      {initials || <User className="size-9" />}
    </div>
  );
}

// ── Cooldown Badge ────────────────────────────────────────────────────────────
function CooldownBadge({ remaining }: { remaining: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
      <Lock className="size-3.5 shrink-0" />
      <span>
        Username & NPP dapat diubah kembali dalam{" "}
        <span className="font-semibold">{remaining}</span>
      </span>
    </div>
  );
}

// ── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.entities);

  // Sensitive-field cooldown
  const [lastChanged] = useState<Date | null>(getLastChanged);
  const cooldownRemaining = getRemainingCooldown(lastChanged);
  const isSensitiveLocked = cooldownRemaining !== null;

  // Local editable state (will be wired to API later)
  const [profileData, setProfileData] = useState({
    name: user?.name ?? "",
    email: "",
    noHp: "",
    username: user?.username ?? "",
    npp: String(user?.npp ?? ""),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profileData,
  });

  const handleEdit = () => {
    reset(profileData);
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    reset(profileData);
    setIsEditing(false);
  };

  const handleSave = (values: ProfileFormValues) => {
    // Check if sensitive fields changed
    const sensitiveChanged =
      values.username !== profileData.username || values.npp !== profileData.npp;

    // TODO: call API to update profile
    setProfileData(values);
    if (sensitiveChanged) {
      saveLastChanged();
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi akun dan data pribadi Anda
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: Identity Card ── */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar name={profileData.name || profileData.username} />
              <div>
                <p className="text-lg font-bold leading-tight">
                  {profileData.name || profileData.username}
                </p>
                <p className="text-sm text-muted-foreground">@{profileData.username}</p>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Check className="size-3.5" />
                  Profil berhasil diperbarui
                </div>
              )}
            </div>

            <div className="mt-4 divide-y divide-border">
              <InfoRow icon={Hash} label="NPP" value={profileData.npp} />
              <InfoRow icon={BadgeCheck} label="Username" value={profileData.username} />
            </div>
          </div>

          {/* Cooldown info card */}
          {isSensitiveLocked && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                  <Clock className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Cooldown Aktif
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                    Username & NPP dikunci selama {COOLDOWN_DAYS} hari sejak perubahan terakhir.
                    Dapat diubah dalam{" "}
                    <span className="font-semibold">{cooldownRemaining}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Edit Form ── */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-semibold">Informasi Pribadi</h2>
                <p className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Ubah data di bawah lalu simpan"
                    : "Klik Edit untuk mengubah data"}
                </p>
              </div>

              {!isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEdit}
                  className="gap-1.5"
                  id="edit-profile-btn"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-1.5"
                    id="cancel-edit-btn"
                  >
                    <X className="size-3.5" />
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    form="profile-form"
                    disabled={!isDirty}
                    className="gap-1.5"
                    id="save-profile-btn"
                  >
                    <Check className="size-3.5" />
                    Simpan
                  </Button>
                </div>
              )}
            </div>

            {/* Card body */}
            <form
              id="profile-form"
              onSubmit={handleSubmit(handleSave)}
              className="grid gap-5 p-6 sm:grid-cols-2"
            >
              {/* Name */}
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="name" className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  Nama Lengkap
                </FieldLabel>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap..."
                  disabled={!isEditing}
                  aria-invalid={!!errors.name}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("name")}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  disabled={!isEditing}
                  aria-invalid={!!errors.email}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("email")}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </Field>

              {/* No HP */}
              <Field>
                <FieldLabel htmlFor="noHp" className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  No. HP / WhatsApp
                </FieldLabel>
                <Input
                  id="noHp"
                  type="tel"
                  placeholder="08xx-xxxx-xxxx"
                  disabled={!isEditing}
                  aria-invalid={!!errors.noHp}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("noHp")}
                />
                <FieldError>{errors.noHp?.message}</FieldError>
              </Field>

              {/* Username */}
              <Field>
                <FieldLabel htmlFor="username" className="flex items-center gap-1.5">
                  <BadgeCheck className="size-3.5 text-muted-foreground" />
                  Username
                  {isSensitiveLocked && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-normal text-amber-600 dark:text-amber-400">
                      <Lock className="size-3" />
                      Terkunci
                    </span>
                  )}
                </FieldLabel>
                <Input
                  id="username"
                  placeholder="username"
                  disabled={!isEditing || isSensitiveLocked}
                  aria-invalid={!!errors.username}
                  className={cn(
                    (!isEditing || isSensitiveLocked) && "cursor-default bg-muted/30",
                  )}
                  {...register("username")}
                />
                {isSensitiveLocked ? (
                  <CooldownBadge remaining={cooldownRemaining!} />
                ) : (
                  <FieldError>{errors.username?.message}</FieldError>
                )}
              </Field>

              {/* NPP */}
              <Field>
                <FieldLabel htmlFor="npp" className="flex items-center gap-1.5">
                  <Hash className="size-3.5 text-muted-foreground" />
                  NPP
                  {isSensitiveLocked && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-normal text-amber-600 dark:text-amber-400">
                      <Lock className="size-3" />
                      Terkunci
                    </span>
                  )}
                </FieldLabel>
                <Input
                  id="npp"
                  placeholder="Nomor Pokok Pegawai"
                  disabled={!isEditing || isSensitiveLocked}
                  aria-invalid={!!errors.npp}
                  className={cn(
                    (!isEditing || isSensitiveLocked) && "cursor-default bg-muted/30",
                  )}
                  {...register("npp")}
                />
                {isSensitiveLocked ? (
                  <CooldownBadge remaining={cooldownRemaining!} />
                ) : (
                  <FieldError>{errors.npp?.message}</FieldError>
                )}
              </Field>
            </form>

            {/* Footer note */}
            <div className="rounded-b-xl border-t border-border bg-muted/20 px-6 py-3">
              <p className="text-xs text-muted-foreground">
                {isSensitiveLocked
                  ? `Username dan NPP dapat diubah kembali setelah cooldown ${COOLDOWN_DAYS} hari berakhir.`
                  : `Username dan NPP dapat diubah, namun hanya sekali setiap ${COOLDOWN_DAYS} hari.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
