import { loginSchema, type LoginSchema } from "@/validations/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/use-store";
import { getLogin } from "../../../stores/auth/async";

export function useLoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const isLoading = loading === "pending";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data: LoginSchema) => {
    const result = await dispatch(getLogin(data));

    if (getLogin.fulfilled.match(result)) {
      navigate("/");
    }
  });

  return {
    register,
    errors,
    isLoading,
    error,
    onSubmit,
  };
}
