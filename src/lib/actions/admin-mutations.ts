"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin";
import { createServerClient } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import {
  sendGiftReceipt,
  sendNewGiftNotification,
  sendSentGiftReceipt,
  sendSentGiftNotification,
} from "@/lib/email";
import { formatCurrency, calculateGrowth } from "@/shared/utils/growth-calculator";
import { getFundByTicker } from "@/shared/constants/funds";
import type { Session } from "@/lib/auth";

// ── small helpers ────────────────────────────────────────────────────

const PROJECTION_YEARS = 18;

async function recordAudit(
  session: Session,
  action: string,
  opts: {
    subjectType?: "gift" | "sent_gift" | "gift_page" | "user" | null;
    subjectId?: string | null;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  const db = createServerClient();
  await db.from("admin_audit").insert({
    admin_email: session.user.email,
    action,
    subject_type: opts.subjectType ?? null,
    subject_id: opts.subjectId ?? null,
    metadata: opts.metadata ?? null,
  });
}

/**
 * In-memory rate limiter for resend actions. Keyed by `${action}:${rowId}`.
 * 3 actions per row per hour (per server process) is plenty for legitimate
 * admin use, and blocks a stuck-button spam scenario.
 */
const resendCounters = new Map<string, { count: number; resetAt: number }>();
const RESEND_LIMIT = 3;
const RESEND_WINDOW_MS = 60 * 60 * 1000;

function checkResendLimit(key: string): void {
  const now = Date.now();
  const entry = resendCounters.get(key);
  if (!entry || now > entry.resetAt) {
    resendCounters.set(key, { count: 1, resetAt: now + RESEND_WINDOW_MS });
    return;
  }
  entry.count++;
  if (entry.count > RESEND_LIMIT) {
    throw new Error(
      "You've resent this email 3 times in the last hour. Wait a bit and try again."
    );
  }
}

// ── refund flow ──────────────────────────────────────────────────────

/**
 * Refund a completed gift-page donation. Destination charges (parent has Stripe
 * Connect) are reversed so the transferred amount comes back too.
 *
 * @param giftId        uuid of the gifts row
 * @param typedConfirm  string the admin typed into the confirm modal; must
 *                      equal the formatted amount (e.g. "$50.00")
 */
export async function refundGift(
  giftId: string,
  typedConfirm: string
): Promise<void> {
  const session = await requireAdminSession();
  const db = createServerClient();

  // Fetch gift row + parent's Connect status via two queries — simpler and
  // type-safer than relying on Supabase's foreign-table join inference.
  const { data: giftRaw } = await db
    .from("gifts")
    .select("id, amount_cents, status, stripe_payment_id, gift_page_id")
    .eq("id", giftId)
    .single();

  type GiftRow = {
    id: string;
    amount_cents: number;
    status: string;
    stripe_payment_id: string | null;
    gift_page_id: string;
  };
  const gift = giftRaw as GiftRow | null;

  if (!gift) throw new Error("Gift not found");
  if (gift.status !== "completed") {
    throw new Error(`Cannot refund a gift with status "${gift.status}".`);
  }
  if (!gift.stripe_payment_id) {
    throw new Error("Gift has no Stripe payment ID — can't refund.");
  }
  const expectedConfirm = formatCurrency(gift.amount_cents / 100);
  if (typedConfirm.trim() !== expectedConfirm) {
    throw new Error(
      `Confirmation text didn't match "${expectedConfirm}". Refund not performed.`
    );
  }

  // Look up the parent (via gift_pages.user_id → users) to decide whether
  // this is a destination charge that needs `reverse_transfer: true`.
  const { data: page } = await db
    .from("gift_pages")
    .select("user_id")
    .eq("id", gift.gift_page_id)
    .single();
  let isDestinationCharge = false;
  if (page?.user_id) {
    const { data: owner } = await db
      .from("users")
      .select("stripe_account_id, stripe_onboarded")
      .eq("id", page.user_id)
      .single();
    isDestinationCharge = !!(
      owner?.stripe_onboarded && owner?.stripe_account_id
    );
  }

  const stripe = getStripe();
  const refund = await stripe.refunds.create(
    {
      payment_intent: gift.stripe_payment_id,
      ...(isDestinationCharge ? { reverse_transfer: true } : {}),
      metadata: { gift_id: giftId, kind: "gift" },
    },
    { idempotencyKey: `refund:gift:${giftId}` }
  );

  // Update DB, guarded against a concurrent double-refund.
  await db
    .from("gifts")
    .update({ status: "refunded" })
    .eq("id", giftId)
    .eq("status", "completed");

  await recordAudit(session, "gift_refunded", {
    subjectType: "gift",
    subjectId: giftId,
    metadata: {
      amount_cents: gift.amount_cents,
      stripe_payment_id: gift.stripe_payment_id,
      stripe_refund_id: refund.id,
      reverse_transfer: isDestinationCharge,
    },
  });

  revalidatePath("/admin/gifts");
  revalidatePath("/admin/users", "layout");
  revalidatePath("/admin");
}

export async function refundSentGift(
  sentGiftId: string,
  typedConfirm: string
): Promise<void> {
  const session = await requireAdminSession();
  const db = createServerClient();

  const { data: rowRaw } = await db
    .from("sent_gifts")
    .select("id, amount_cents, status, stripe_payment_id")
    .eq("id", sentGiftId)
    .single();

  type SentGiftRow = {
    id: string;
    amount_cents: number;
    status: string;
    stripe_payment_id: string | null;
  };
  const row = rowRaw as SentGiftRow | null;

  if (!row) throw new Error("Sent gift not found");
  if (row.status !== "completed") {
    throw new Error(`Cannot refund a sent gift with status "${row.status}".`);
  }
  if (!row.stripe_payment_id) {
    throw new Error("Sent gift has no Stripe payment ID — can't refund.");
  }
  const expectedConfirm = formatCurrency(row.amount_cents / 100);
  if (typedConfirm.trim() !== expectedConfirm) {
    throw new Error(
      `Confirmation text didn't match "${expectedConfirm}". Refund not performed.`
    );
  }

  const stripe = getStripe();
  const refund = await stripe.refunds.create(
    {
      payment_intent: row.stripe_payment_id,
      metadata: { sent_gift_id: sentGiftId, kind: "sent_gift" },
    },
    { idempotencyKey: `refund:sent_gift:${sentGiftId}` }
  );

  await db
    .from("sent_gifts")
    .update({ status: "refunded" })
    .eq("id", sentGiftId)
    .eq("status", "completed");

  await recordAudit(session, "sent_gift_refunded", {
    subjectType: "sent_gift",
    subjectId: sentGiftId,
    metadata: {
      amount_cents: row.amount_cents,
      stripe_payment_id: row.stripe_payment_id,
      stripe_refund_id: refund.id,
      reverse_transfer: false,
    },
  });

  revalidatePath("/admin/gifts");
  revalidatePath("/admin");
}

// ── gift page pause / unpause ────────────────────────────────────────

export async function togglePauseGiftPage(pageId: string): Promise<void> {
  const session = await requireAdminSession();
  const db = createServerClient();

  const { data: page } = await db
    .from("gift_pages")
    .select("id, status")
    .eq("id", pageId)
    .single();
  if (!page) throw new Error("Gift page not found");
  if (page.status !== "active" && page.status !== "paused") {
    throw new Error(
      `Cannot toggle pause on a gift page with status "${page.status}".`
    );
  }
  const next = page.status === "active" ? "paused" : "active";

  await db.from("gift_pages").update({ status: next }).eq("id", pageId);

  await recordAudit(
    session,
    next === "paused" ? "gift_page_paused" : "gift_page_unpaused",
    {
      subjectType: "gift_page",
      subjectId: pageId,
      metadata: { previous: page.status, current: next },
    }
  );

  revalidatePath("/admin/gift-pages");
  revalidatePath("/admin");
}

// ── resend email flows ───────────────────────────────────────────────

export async function resendGiftReceipt(giftId: string): Promise<void> {
  const session = await requireAdminSession();
  checkResendLimit(`gift_receipt:${giftId}`);
  const db = createServerClient();

  const { data: gift } = await db
    .from("gifts")
    .select(
      "id, amount_cents, giver_name, giver_email, gift_page_id, status"
    )
    .eq("id", giftId)
    .single();
  if (!gift) throw new Error("Gift not found");
  if (gift.status !== "completed") {
    throw new Error("Only completed gifts can be resent.");
  }

  const { data: page } = await db
    .from("gift_pages")
    .select("child_name, event_name, fund_name")
    .eq("id", gift.gift_page_id)
    .single();
  if (!page) throw new Error("Gift page not found");

  await sendGiftReceipt({
    giverEmail: gift.giver_email,
    giverName: gift.giver_name,
    childName: page.child_name,
    eventName: page.event_name,
    amount: formatCurrency(gift.amount_cents / 100),
    fundName: page.fund_name,
  });

  await recordAudit(session, "gift_receipt_resent", {
    subjectType: "gift",
    subjectId: giftId,
    metadata: { to: gift.giver_email },
  });
}

export async function resendGiftNotification(giftId: string): Promise<void> {
  const session = await requireAdminSession();
  checkResendLimit(`gift_notification:${giftId}`);
  const db = createServerClient();

  const { data: gift } = await db
    .from("gifts")
    .select(
      "id, amount_cents, giver_name, note, gift_page_id, status"
    )
    .eq("id", giftId)
    .single();
  if (!gift) throw new Error("Gift not found");
  if (gift.status !== "completed") {
    throw new Error("Only completed gifts can be resent.");
  }

  const { data: page } = await db
    .from("gift_pages")
    .select("child_name, user_id")
    .eq("id", gift.gift_page_id)
    .single();
  if (!page) throw new Error("Gift page not found");

  const { data: owner } = await db
    .from("users")
    .select("email, name")
    .eq("id", page.user_id)
    .single();
  if (!owner?.email) throw new Error("Parent account has no email on file.");

  await sendNewGiftNotification({
    parentEmail: owner.email,
    parentName: owner.name || "there",
    giverName: gift.giver_name,
    childName: page.child_name,
    amount: formatCurrency(gift.amount_cents / 100),
    note: gift.note,
  });

  await recordAudit(session, "gift_notification_resent", {
    subjectType: "gift",
    subjectId: giftId,
    metadata: { to: owner.email },
  });
}

export async function resendSentGiftReceipt(sentGiftId: string): Promise<void> {
  const session = await requireAdminSession();
  checkResendLimit(`sent_gift_receipt:${sentGiftId}`);
  const db = createServerClient();

  const { data: row } = await db
    .from("sent_gifts")
    .select(
      "id, slug, giver_email, giver_name, child_name, occasion, amount_cents, fund_ticker, fund_name, recipient_email, status"
    )
    .eq("id", sentGiftId)
    .single();
  if (!row) throw new Error("Sent gift not found");
  if (row.status !== "completed") {
    throw new Error("Only completed sent gifts can be resent.");
  }

  const fund = getFundByTicker(row.fund_ticker);
  const amount = formatCurrency(row.amount_cents / 100);
  const projectedValue = fund
    ? formatCurrency(
        calculateGrowth(row.amount_cents / 100, fund.avgAnnualReturn, PROJECTION_YEARS)
      )
    : amount;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  await sendSentGiftReceipt({
    giverEmail: row.giver_email,
    giverName: row.giver_name,
    childName: row.child_name,
    occasion: row.occasion,
    amount,
    fundName: row.fund_name,
    recipientEmail: row.recipient_email,
    shareUrl: `${appUrl}/g/${row.slug}`,
    projectedValue,
  });

  await recordAudit(session, "sent_gift_receipt_resent", {
    subjectType: "sent_gift",
    subjectId: sentGiftId,
    metadata: { to: row.giver_email },
  });
}

export async function resendSentGiftNotification(
  sentGiftId: string
): Promise<void> {
  const session = await requireAdminSession();
  checkResendLimit(`sent_gift_notification:${sentGiftId}`);
  const db = createServerClient();

  const { data: row } = await db
    .from("sent_gifts")
    .select(
      "id, slug, giver_name, child_name, occasion, amount_cents, fund_ticker, fund_name, message, recipient_email, status"
    )
    .eq("id", sentGiftId)
    .single();
  if (!row) throw new Error("Sent gift not found");
  if (row.status !== "completed") {
    throw new Error("Only completed sent gifts can be resent.");
  }

  const fund = getFundByTicker(row.fund_ticker);
  const amount = formatCurrency(row.amount_cents / 100);
  const projectedValue = fund
    ? formatCurrency(
        calculateGrowth(row.amount_cents / 100, fund.avgAnnualReturn, PROJECTION_YEARS)
      )
    : amount;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  await sendSentGiftNotification({
    recipientEmail: row.recipient_email,
    giverName: row.giver_name,
    childName: row.child_name,
    occasion: row.occasion,
    amount,
    fundName: row.fund_name,
    message: row.message,
    shareUrl: `${appUrl}/g/${row.slug}`,
    projectedValue,
  });

  await recordAudit(session, "sent_gift_notification_resent", {
    subjectType: "sent_gift",
    subjectId: sentGiftId,
    metadata: { to: row.recipient_email },
  });
}
