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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={onNavigate}
        >
          <Sprout className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-text-primary">SeedGift</span>
        </Link>
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-light text-primary-dark"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-border-light">
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors w-full cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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

      {/* Desktop sidebar — always expanded, pushes content (no overlay) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[240px] bg-surface border-r border-border-light flex-col z-40">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}
