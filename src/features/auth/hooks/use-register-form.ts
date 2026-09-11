import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { getRegister } from "@/stores/auth/async";
import {
  registerSchema,
  type RegisterSchema,
} from "@/validations/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function useRegisterForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) => state.auth.loading);
  const isLoading = loading === "pending";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (data: RegisterSchema) => {
    const result = await dispatch(getRegister(data));

    if (getRegister.fulfilled.match(result)) {
      await Swal.fire({
        icon: "success",
        title: "Akun berhasil dibuat!",
        text: "Silakan login dengan akun Anda.",
        showConfirmButton: false,
        background: "#1D1D1D",
        color: "#fff",
        iconColor: "#04A51E",
        timer: 1500,
      });
      navigate("/login");
    } else {
      const errorMessage =
        (result.payload as string) ?? "An unexpected error occurred";
      Swal.fire({
        icon: "error",
        title: "Oops..",
        text: errorMessage,
        background: "#1D1D1D",
        color: "#fff",
      });
    }
  });

  return {
    register,
    errors,
    isLoading,
    onSubmit,
  };
}
