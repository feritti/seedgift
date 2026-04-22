import { Sidebar } from "@/components/layout/sidebar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isAdmin = !!session?.isAdmin;

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />
      <main className="flex-1 md:ml-[240px]">
        <div className="p-4 pt-[72px] md:pt-6 md:p-6 lg:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
