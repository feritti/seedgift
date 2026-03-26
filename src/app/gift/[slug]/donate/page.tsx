import { GiftCheckoutView } from "@/components/gift/gift-checkout-view";
import { getGiftPageBySlug, getGiftPagePublicData } from "@/lib/actions/gift-pages";
import { notFound } from "next/navigation";

export default async function DonatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const giftPage = await getGiftPageBySlug(slug);

  if (!giftPage) notFound();

  const publicData = await getGiftPagePublicData(giftPage.id);

  return (
    <GiftCheckoutView
      giftPage={{
        id: giftPage.id,
        slug: giftPage.slug,
        childName: giftPage.child_name,
        childPhotoUrl: giftPage.child_photo_url,
        childDob: giftPage.child_dob,
        eventName: giftPage.event_name,
        fundTicker: giftPage.fund_ticker,
        fundName: giftPage.fund_name,
        status: giftPage.status,
      }}
      publicData={publicData}
    />
  );
}
