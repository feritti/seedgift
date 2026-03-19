export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    question: "How does SeedGift work?",
    answer:
      "A parent creates a gift page for their child, choosing an investment fund and event. They share the link with family and friends, who can then send financial gifts. The funds are sent directly to the parent via Stripe, who can then invest them in the chosen fund.",
  },
  {
    question: "Is the money actually invested automatically?",
    answer:
      "Not yet — SeedGift handles the gifting and collection. Parents receive the funds via Stripe and invest them in their preferred custodial brokerage account. We show projected growth based on historical returns to help gift-givers understand the impact of their gift.",
  },
  {
    question: "What are the fees?",
    answer:
      "SeedGift charges a small platform fee on each gift, plus standard Stripe payment processing fees. There are no subscription fees or hidden charges.",
  },
  {
    question: "Is this safe and secure?",
    answer:
      "Yes. All payments are processed through Stripe, a PCI-compliant payment processor used by millions of businesses. We never store credit card information on our servers.",
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
