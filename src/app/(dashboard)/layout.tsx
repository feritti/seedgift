"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-[60px]">
          <div className="p-4 pt-[72px] md:pt-6 md:p-6 lg:p-8 max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
