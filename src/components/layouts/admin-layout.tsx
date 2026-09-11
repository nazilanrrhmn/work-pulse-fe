import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import DesktopSidebar, { MobileDrawer, BottomNav } from "./sidebar";
import Header from "./header";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleCollapse = useCallback(() => setCollapsed((prev) => !prev), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      {/* Desktop Sidebar — md and above */}
      <DesktopSidebar collapsed={collapsed} onToggle={toggleCollapse} />

      {/* Mobile Drawer — slides in from left on small/tablet screens */}
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} />

      {/* Main area — min-w-0 prevents flex child from overflowing */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header — passes hamburger trigger for mobile */}
        <Header onMenuOpen={openDrawer} />

        {/* Page content — scrollable; adds bottom padding on mobile for the bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation — only visible on small screens */}
      <BottomNav />
    </div>
  );
}
