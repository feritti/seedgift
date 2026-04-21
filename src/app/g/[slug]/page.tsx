import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSentGiftBySlug } from "@/lib/actions/sent-gifts";
import { GiftCardView } from "./gift-card-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sentGift = await getSentGiftBySlug(slug);
  if (!sentGift) return { title: "Gift — SeedGift" };
  return {
    title: `A SeedGift for ${sentGift.childName} — ${sentGift.occasion}`,
    description: `${sentGift.giverName} sent an investment gift for ${sentGift.childName}. View the details and claim it on SeedGift.`,
  };
}

export default async function GiftCardPage({ params }: Props) {
  const { slug } = await params;
  const sentGift = await getSentGiftBySlug(slug);
  if (!sentGift) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const shareUrl = `${appUrl}/g/${sentGift.slug}`;

  return <GiftCardView sentGift={sentGift} shareUrl={shareUrl} />;
}
