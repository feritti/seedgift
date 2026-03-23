export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    question: "How does SeedGift work?",
    answer:
      "A parent creates a gift page for their child and shares the link with family and friends. Loved ones visit the page, choose a gift amount, and pay. The funds are sent directly to the parent's bank account via Stripe. SeedGift is a gifting platform — we collect and deliver monetary gifts. Parents decide independently how to save or invest the funds.",
  },
  {
    question: "Does SeedGift invest the money?",
    answer:
      "No. SeedGift is a gifting and payment collection platform, not an investment service. Parents receive gift funds directly in their bank account and choose independently how to save or invest — whether that's a 529 plan, a UTMA/UGMA custodial account, or a brokerage account. We do not manage, hold, or invest funds on anyone's behalf.",
  },
  {
    question: "What are the fees?",
    answer:
      "SeedGift charges a small platform fee on each gift, plus standard Stripe payment processing fees. There are no subscription fees or hidden charges.",
  },
  {
    question: "Is this safe and secure?",
    answer:
      "Yes. All payments are processed through Stripe, a PCI-compliant payment processor trusted by millions of businesses worldwide. Funds go directly to the parent's verified bank account — SeedGift never holds or stores your money. We never store credit card information on our servers.",
  },
  {
    question: "Can anyone send a gift?",
    answer:
      "Yes! Gift-givers don't need a SeedGift account. They simply visit the gift page link, choose an amount, and complete the payment. It takes less than a minute.",
  },
  {
    question: "How do parents receive the funds?",
    answer:
      "Parents connect their bank account through Stripe during setup. When someone sends a gift, the funds are automatically transferred to the parent's bank account after a short processing period.",
  },
];
