import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { logout } from "@/stores/auth/slice";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuOpen?: () => void;
}

export default function Header({ onMenuOpen }: HeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.entities);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      {/* Left: Hamburger (mobile only) + greeting */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only visible on mobile/tablet where sidebar is hidden */}
        <button
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="text-sm text-muted-foreground">
          Welcome back,{" "}
          <span className="font-semibold text-foreground">
            {user?.name ?? user?.npp ?? "—"}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="size-4" />
        </button>

        {/* User avatar + info */}
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm md:px-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {user?.name?.charAt(0).toUpperCase() ??
              user?.npp?.charAt(0).toUpperCase() ?? (
                <User className="size-4" />
              )}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="font-medium leading-none">{user?.name ?? user?.npp}</span>
            <span className="text-xs text-muted-foreground">{user?.npp}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
