export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
}

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Gift Pages", href: "/gift-pages", icon: "Gift" },
  { label: "Gifts", href: "/gifts", icon: "Heart" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];
