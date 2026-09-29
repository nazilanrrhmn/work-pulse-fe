import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "cn";
import {
  LayoutDashboard,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  BriefcaseBusiness,
  UserCircle,
  X,
  type LucideIcon,
} from "lucide-react";

// ── Nav items ──────────────────────────────────────────────────────────────────
interface NavItem {
  readonly label: string;
  readonly to: string;
  readonly icon: LucideIcon;
}

const navItems: readonly NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Timesheet", to: "/timesheet", icon: CalendarDays },
];

const profileItem: NavItem = {
  label: "Profil Saya",
  to: "/profile",
  icon: UserCircle,
};

const allItems: readonly NavItem[] = [...navItems, profileItem];

// ── Brand (logo + nama aplikasi) ───────────────────────────────────────────────
function Brand({ showLabel = true }: { readonly showLabel?: boolean }) {
  return (
    <>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <BriefcaseBusiness className="size-4" />
      </div>
      {showLabel && (
        <span className="truncate font-semibold tracking-tight">
          Work<span className="font-bold">Pulse</span>
        </span>
      )}
    </>
  );
}

// ── Shared NavLink ─────────────────────────────────────────────────────────────
interface NavLinkProps {
  readonly item: NavItem;
  readonly collapsed: boolean;
  readonly onClick?: () => void;
}

function NavLink({ item, collapsed, onClick }: NavLinkProps) {
  const { pathname } = useLocation();
  const isActive = pathname === item.to;

  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <item.icon className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

// ── Desktop Sidebar ────────────────────────────────────────────────────────────
interface DesktopSidebarProps {
  readonly collapsed: boolean;
  readonly onToggle: () => void;
}

function DesktopSidebar({ collapsed, onToggle }: DesktopSidebarProps) {
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <aside
      className={cn(
        "relative hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out md:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "gap-2",
        )}
      >
        <Brand showLabel={!collapsed} />
      </div>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2">
        {navItems.map((item) => (
          <NavLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer: Profile + Toggle */}
      <div className="flex flex-col gap-1 border-t border-sidebar-border p-2">
        <NavLink item={profileItem} collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={toggleLabel}
          title={toggleLabel}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="size-5 shrink-0" />
              <span className="truncate">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// ── Mobile Drawer ──────────────────────────────────────────────────────────────
interface MobileDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Cegah scroll body saat drawer terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    // Container fixed full-screen. `invisible` saat tertutup mengeluarkan
    // link di dalamnya dari urutan tab & pembaca layar, dan transisi
    // visibility menjaga animasi slide tetap terlihat saat menutup.
    // overflow-hidden mencegah panel w-72 melebarkan layout halaman.
    <div
      className={cn(
        "fixed inset-0 z-40 overflow-hidden transition-[visibility] duration-300 md:hidden",
        open ? "visible pointer-events-auto" : "invisible pointer-events-none",
      )}
    >
      {/* Backdrop: <button> native agar dapat diklik, disentuh, dan dibaca
          pembaca layar. tabIndex -1 karena keyboard sudah dilayani Escape
          dan tombol close di dalam panel. */}
      <button
        type="button"
        tabIndex={-1}
        onClick={onClose}
        aria-label="Close menu"
        className={cn(
          "absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Drawer panel — slide dari kiri */}
      <aside
        aria-label="Navigation menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <Brand />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              collapsed={false}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <NavLink item={profileItem} collapsed={false} onClick={onClose} />
        </div>
      </aside>
    </div>
  );
}

// ── Mobile Bottom Navigation ───────────────────────────────────────────────────
function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-border bg-background md:hidden"
    >
      {allItems.map(({ label, to, icon: Icon }) => {
        const isActive = pathname === to;

        return (
          <Link
            key={to}
            to={to}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-5 transition-transform",
                isActive && "scale-110",
              )}
            />
            <span className="leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ── Exports ───────────────────────────────────────────────────────────────────
export { MobileDrawer, BottomNav };
export default DesktopSidebar;
