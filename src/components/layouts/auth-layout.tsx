import { BriefcaseBusiness } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BriefcaseBusiness className="size-4" />
            </div>
            <div className="font-medium">
              Work<span className="font-bold">Pulse</span>
            </div>
          </Link>
        </div>

        {/* Form content */}
        <div className="flex flex-1 items-center justify-center">
          {/* Wider on tablet, constrained on desktop */}
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Hero image — hidden on mobile, shown on lg+ */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="./hero-login.png"
          alt="Work Pulse authentication background"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        {/* Subtle overlay branding */}
        <div className="absolute inset-0 flex flex-col items-start justify-end p-10 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-3xl font-bold text-white leading-tight">
            Work<span className="font-extrabold">Pulse</span>
          </p>
          <p className="mt-1 text-sm text-white/70">
            Manajemen kehadiran & timesheet modern
          </p>
        </div>
      </div>
    </div>
  );
}
