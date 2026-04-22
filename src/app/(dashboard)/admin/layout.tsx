import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";

/**
 * Guard for every /admin/* page. Non-admins get a 404 — not a 403 —
 * so the route doesn't advertise its existence. Each admin server
 * action separately enforces `requireAdminSession()` as defence in
 * depth, since server actions can be invoked without hitting a layout.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.isAdmin) notFound();
  return <>{children}</>;
}
