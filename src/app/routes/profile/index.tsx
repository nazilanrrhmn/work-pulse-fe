import {
  User,
  Pencil,
  Check,
  X,
  Phone,
  Mail,
  Hash,
  Clock,
  Lock,
  Building,
  Building2,
  Briefcase,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "cn";

import Avatar from "@/features/profile/components/avatar";
import CooldownBadge from "@/features/profile/components/cooldown-badge";
import InfoRow from "@/features/profile/components/info-row";
import SignatureUploader from "@/features/profile/components/signature-uploader";
import { useProfileForm, COOLDOWN_DAYS } from "@/features/profile/hooks/use-profile-form";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const {
    profileData,
    isEditing,
    saveSuccess,
    isSensitiveLocked,
    cooldownRemaining,
    register,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleSave,
    errors,
    isDirty,
  } = useProfileForm();

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
              <Avatar name={profileData.name || profileData.npp} />
              <div>
                <p className="text-lg font-bold leading-tight">
                  {profileData.name || profileData.npp}
                </p>
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
                    NPP dikunci selama {COOLDOWN_DAYS} hari sejak perubahan terakhir.
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

              <Field>
                <FieldLabel htmlFor="nppBni" className="flex items-center gap-1.5">
                  <Hash className="size-3.5 text-muted-foreground" /> NPP BNI
                </FieldLabel>
                <Input
                  id="nppBni"
                  type="number"
                  placeholder="Masukkan NPP BNI"
                  disabled={!isEditing}
                  aria-invalid={!!errors.nppBni}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("nppBni")}
                />
                <FieldError>{errors.nppBni?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="manager" className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" /> Manager
                </FieldLabel>
                <Input
                  id="manager"
                  placeholder="Nama Manager"
                  disabled={!isEditing}
                  aria-invalid={!!errors.manager}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("manager")}
                />
                <FieldError>{errors.manager?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="departemenHead" className="flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-muted-foreground" /> Departemen Head
                </FieldLabel>
                <Input
                  id="departemenHead"
                  placeholder="Nama Departemen Head"
                  disabled={!isEditing}
                  aria-invalid={!!errors.departemenHead}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("departemenHead")}
                />
                <FieldError>{errors.departemenHead?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="divisi" className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground" /> Divisi
                </FieldLabel>
                <Input
                  id="divisi"
                  placeholder="Nama Divisi"
                  disabled={!isEditing}
                  aria-invalid={!!errors.divisi}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("divisi")}
                />
                <FieldError>{errors.divisi?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="departemen" className="flex items-center gap-1.5">
                  <Building className="size-3.5 text-muted-foreground" /> Departemen
                </FieldLabel>
                <Input
                  id="departemen"
                  placeholder="Nama Departemen"
                  disabled={!isEditing}
                  aria-invalid={!!errors.departemen}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("departemen")}
                />
                <FieldError>{errors.departemen?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="kelompok" className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" /> Kelompok
                </FieldLabel>
                <Input
                  id="kelompok"
                  placeholder="Nama Kelompok"
                  disabled={!isEditing}
                  aria-invalid={!!errors.kelompok}
                  className={cn(!isEditing && "cursor-default bg-muted/30")}
                  {...register("kelompok")}
                />
                <FieldError>{errors.kelompok?.message}</FieldError>
              </Field>
            </form>

            {/* Footer note */}
            <div className="rounded-b-xl border-t border-border bg-muted/20 px-6 py-3">
              <p className="text-xs text-muted-foreground">
                {isSensitiveLocked
                  ? `NPP dapat diubah kembali setelah cooldown ${COOLDOWN_DAYS} hari berakhir.`
                  : `NPP dapat diubah, namun hanya sekali setiap ${COOLDOWN_DAYS} hari.`}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <SignatureUploader />
          </div>
        </div>
      </div>
    </div>
  );
}
