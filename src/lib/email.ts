import { Resend } from "resend";
import {
  giftReceiptEmail,
  newGiftNotificationEmail,
  thankYouEmail,
  sentGiftReceiptEmail,
  sentGiftNotificationEmail,
} from "@/lib/email-templates";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = "SeedGift <noreply@seedgift.xyz>";

export async function sendGiftReceipt({
  giverEmail,
  giverName,
  childName,
  eventName,
  amount,
  fundName,
}: {
  giverEmail: string;
  giverName: string;
  childName: string;
  eventName: string;
  amount: string;
  fundName: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: giverEmail,
    subject: `Your gift for ${childName}'s ${eventName} is confirmed!`,
    html: giftReceiptEmail({ giverName, childName, eventName, amount, fundName }),
  });
}

export async function sendNewGiftNotification({
  parentEmail,
  parentName,
  giverName,
  childName,
  amount,
  note,
}: {
  parentEmail: string;
  parentName: string;
  giverName: string;
  childName: string;
  amount: string;
  note: string | null;
}) {
  await getResend().emails.send({
    from: FROM,
    to: parentEmail,
    subject: `${giverName} just sent a gift for ${childName}!`,
    html: newGiftNotificationEmail({ parentName, giverName, childName, amount, note }),
  });
}

export async function sendSentGiftReceipt({
  giverEmail,
  giverName,
  childName,
  occasion,
  amount,
  fundName,
  recipientEmail,
  shareUrl,
  projectedValue,
}: {
  giverEmail: string;
  giverName: string;
  childName: string;
  occasion: string;
  amount: string;
  fundName: string;
  recipientEmail: string;
  shareUrl: string;
  projectedValue: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: giverEmail,
    subject: `Your SeedGift for ${childName}'s ${occasion} is on its way!`,
    html: sentGiftReceiptEmail({
      giverName,
      childName,
      occasion,
      amount,
      fundName,
      recipientEmail,
      shareUrl,
      projectedValue,
    }),
  });
}

export async function sendSentGiftNotification({
  recipientEmail,
  giverName,
  childName,
  occasion,
  amount,
  fundName,
  message,
  shareUrl,
  projectedValue,
}: {
  recipientEmail: string;
  giverName: string;
  childName: string;
  occasion: string;
  amount: string;
  fundName: string;
  message: string | null;
  shareUrl: string;
  projectedValue: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `${giverName} sent a SeedGift for ${childName}`,
    html: sentGiftNotificationEmail({
      giverName,
      childName,
      occasion,
      amount,
      fundName,
      message,
      shareUrl,
      projectedValue,
    }),
  });
}

export async function sendThankYouEmail({
  giverEmail,
  giverName,
  childName,
  parentName,
  message,
}: {
  giverEmail: string;
  giverName: string;
  childName: string;
  parentName: string;
  message: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: giverEmail,
    subject: `A thank you from ${parentName} for your gift to ${childName}`,
    html: thankYouEmail({ giverName, childName, parentName, message }),
  });
}
