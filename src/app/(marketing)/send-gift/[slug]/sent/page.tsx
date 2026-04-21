import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSentGiftBySlug } from "@/lib/actions/sent-gifts";
import { SentSuccessView } from "./sent-success-view";

export const metadata: Metadata = {
  title: "Gift sent — SeedGift",
  description: "Your SeedGift is on its way.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SentPage({ params }: Props) {
  const { slug } = await params;
  const sentGift = await getSentGiftBySlug(slug);
  if (!sentGift) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const shareUrl = `${appUrl}/g/${sentGift.slug}`;

  return <SentSuccessView sentGift={sentGift} shareUrl={shareUrl} />;
}
