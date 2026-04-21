import type { Metadata } from "next";
import { SendGiftForm } from "./send-gift-form";

export const metadata: Metadata = {
  title: "Send a SeedGift — Invest in a child's future",
  description:
    "Send a meaningful gift that grows with the kid you love. Pick an investment, set an amount, and we'll send it to the parent — no account needed to send.",
};

export default function SendGiftPage() {
  return <SendGiftForm />;
}
