import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { GiftPageForm } from "@/components/dashboard/gift-page-form";
import { getGiftPage } from "@/lib/actions/gift-pages";
import { notFound } from "next/navigation";

export default async function EditGiftPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const giftPage = await getGiftPage(id);

  if (!giftPage) notFound();

  return (
    <div>
      <Link
        href="/gift-pages"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gift Pages
      </Link>

      <h1 className="text-3xl text-text-primary mb-2">Edit Gift Page</h1>
      <p className="text-text-secondary mb-8">Update your gift page details</p>

      <GiftPageForm
        mode="edit"
        giftPageId={id}
        defaultValues={{
          childName: giftPage.child_name,
          childDob: giftPage.child_dob ?? "",
          eventName: giftPage.event_name,
          fundTicker: giftPage.fund_ticker,
        }}
      />
    </div>
  );
}
