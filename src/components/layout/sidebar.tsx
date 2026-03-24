"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gift,
  Heart,
  Settings,
  BookOpen,
  Sprout,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Gift Pages", href: "/gift-pages", icon: Gift },
  { label: "Gifts", href: "/gifts", icon: Heart },
  { label: "Resources", href: "/resources", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

function SidebarContent({
  pathname,
  onNavigate,
  collapsed,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <>
      {/* Logo */}
      <div
        className={cn(
          "p-6 pb-4 flex items-center",
          collapsed ? "justify-center px-3" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={onNavigate}
          >
            <Sprout className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-text-primary">
              SeedGift
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" onClick={onNavigate}>
            <Sprout className="h-7 w-7 text-primary" />
          </Link>
        )}
        {onNavigate && !collapsed && (
          <button
            onClick={onNavigate}
            className="text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                collapsed
                  ? "justify-center px-2 py-2.5"
                  : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-primary-light text-primary-dark"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 rounded-[var(--radius-sm)] bg-text-primary text-text-inverse text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-border-light">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "group relative flex items-center rounded-[var(--radius-md)] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors w-full cursor-pointer",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && "Sign Out"}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2.5 py-1 rounded-[var(--radius-sm)] bg-text-primary text-text-inverse text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(true);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border-light flex items-center justify-between px-4 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-text-primary">SeedGift</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-text-secondary hover:text-text-primary cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 h-screen w-[260px] bg-surface border-r border-border-light flex flex-col z-50 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar backdrop */}
      {!desktopCollapsed && (
        <div
          className="hidden md:block fixed inset-0 z-30"
          onClick={() => setDesktopCollapsed(true)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed left-0 top-0 h-screen bg-surface border-r border-border-light flex-col z-40 transition-all duration-200",
          desktopCollapsed ? "w-[60px]" : "w-[260px]"
        )}
      >
        <SidebarContent pathname={pathname} collapsed={desktopCollapsed} />
        <div className="p-2 border-t border-border-light">
          <button
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="flex items-center justify-center w-full py-2 rounded-[var(--radius-md)] text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            title={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {desktopCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
