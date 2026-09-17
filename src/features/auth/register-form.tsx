import { Link } from "react-router-dom";
import { cn } from "cn";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegisterForm } from "./hooks/use-register-form";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { register, errors, isLoading, onSubmit } = useRegisterForm();

  return (
    <div className="flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <FieldGroup>
          {/* Full Name */}
          <Field>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              {...register("name")}
              id="name"
              type="text"
              placeholder="John Doe"
            />
            <FieldError errors={[errors.name]} />
          </Field>

          {/* Email */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="name@example.com"
            />
            <FieldError errors={[errors.email]} />
          </Field>

          {/* NPP */}
          <Field>
            <FieldLabel htmlFor="npp">NPP</FieldLabel>
            <Input
              {...register("npp")}
              id="npp"
              type="text"
              placeholder="K-0001"
            />
            <FieldError errors={[errors.npp]} />
          </Field>

          {/* No HP */}
          <Field>
            <FieldLabel htmlFor="phone">No. HP</FieldLabel>
            <Input
              {...register("phone")}
              id="noHp"
              type="tel"
              placeholder="08123456789"
            />
            <FieldError errors={[errors.phone]} />
          </Field>

          {/* Password */}
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              {...register("password")}
              id="password"
              type="password"
              placeholder="**********"
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
