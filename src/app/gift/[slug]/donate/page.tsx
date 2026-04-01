import { redirect } from "next/navigation";

export default async function DonatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/gift/${slug}`);
}
