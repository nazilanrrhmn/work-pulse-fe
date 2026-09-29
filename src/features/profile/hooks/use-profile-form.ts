import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector, useAppDispatch } from "@/hooks/use-store";
import { fetchProfile, updateProfile } from "@/stores/profile/async";
import { profileSchema, type ProfileFormValues } from "@/validations/profileSchema";



export function useProfileForm() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.entities);
  const { data: profileApiData, loading, fetchLoading, error: profileError } = useAppSelector((state) => state.profile);
  const isLoading = loading === "pending";
  const isFetching = fetchLoading === "pending" || fetchLoading === "idle";

  // Fetch profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);



  // Local editable state — initialized from API data
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

  // Populate form when API data arrives
  useEffect(() => {
    if (profileApiData) {
      const mapped: ProfileFormValues = {
        name: profileApiData.name ?? "",
        email: profileApiData.email ?? "",
        noHp: profileApiData.phone ?? "",
        npp: profileApiData.npp ?? "",
        nppBni: profileApiData.nppBni ?? 0,
        manager: profileApiData.manager ?? "",
        departemenHead: profileApiData.departemenHead ?? "",
        divisi: profileApiData.divisi ?? "",
        departemen: profileApiData.departemen ?? "",
        kelompok: profileApiData.kelompok ?? "",
      };
      setProfileData(mapped);
      reset(mapped);
    }
  }, [profileApiData]);

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
    try {
      await dispatch(
        updateProfile({
          nppBni: values.nppBni,
          manager: values.manager,
          departemenHead: values.departemenHead,
          divisi: values.divisi,
          departemen: values.departemen,
          kelompok: values.kelompok,
        })
      ).unwrap();

      setProfileData(values);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Re-fetch profile to sync with server
      dispatch(fetchProfile());
    } catch (error) {
      console.error(error);
    }
  };

  return {
    profileData,
    isEditing,
    saveSuccess,
    register,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleSave,
    errors,
    isDirty,
    isLoading,
    isFetching,
    profileError,
  };
}
