import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector, useAppDispatch } from "@/hooks/use-store";
import { updateBniProfile, updateProfile } from "@/stores/profile/async";
import { profileSchema, type ProfileFormValues } from "@/validations/profileSchema";

export const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
const LS_KEY = "wp_sensitive_fields_last_changed";

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

export function getRemainingCooldown(lastChanged: Date | null): string | null {
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

export function useProfileForm() {
  const user = useAppSelector((state) => state.auth.entities);
  const { loading, error: profileError } = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const isLoading = loading === "pending";

  // Sensitive-field cooldown
  const [lastChanged] = useState<Date | null>(getLastChanged);
  const cooldownRemaining = getRemainingCooldown(lastChanged);
  const isSensitiveLocked = cooldownRemaining !== null;

  // Local editable state
  const [profileData, setProfileData] = useState<ProfileFormValues>({
    name: user?.name ?? "",
    email: "",
    noHp: "",
    npp: String(user?.npp ?? ""),
    nppBni: 0,
    manager: "",
    departemenHead: "",
    divisi: "",
    departemen: "",
    kelompok: "",
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

  const handleSave = async (values: ProfileFormValues) => {
    const sensitiveChanged = values.npp !== profileData.npp;

    try {
      // Update Informasi Pribadi
      await dispatch(
        updateProfile({
          name: values.name,
          email: values.email,
          noHp: values.noHp,
          npp: values.npp,
        })
      ).unwrap();
      
      // Update BNI Profile
      await dispatch(
        updateBniProfile({
          nppBni: values.nppBni,
          manager: values.manager,
          departemenHead: values.departemenHead,
          divisi: values.divisi,
          departemen: values.departemen,
          kelompok: values.kelompok,
        })
      ).unwrap();

      setProfileData(values);
      if (sensitiveChanged) {
        saveLastChanged();
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return {
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
    isLoading,
    profileError,
  };
}
