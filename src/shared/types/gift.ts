export interface Gift {
  id: string;
  giftPageId: string;
  amountCents: number;
  giverName: string;
  giverEmail: string;
  note: string | null;
  stripePaymentId: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  thanked: boolean;
  createdAt: string;
}
