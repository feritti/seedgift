export type SentGiftStatus = "pending" | "completed" | "failed" | "refunded";

export interface SentGift {
  id: string;
  slug: string;
  giverName: string;
  giverEmail: string;
  recipientEmail: string;
  recipientName: string | null;
  childName: string;
  occasion: string;
  amountCents: number;
  fundTicker: string;
  fundName: string;
  message: string | null;
  stripePaymentId: string | null;
  status: SentGiftStatus;
  claimedByUserId: string | null;
  claimedAt: string | null;
  fundTickerFinal: string | null;
  paidOutAt: string | null;
  createdAt: string;
}
