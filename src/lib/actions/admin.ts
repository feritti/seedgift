import { requireAdminSession } from "@/lib/admin";
import { createServerClient } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/**
 * All admin server-side queries in one place. Every exported function
 * calls `requireAdminSession()` as its first statement — the /admin
 * layout guard is defence-in-depth only; these helpers must enforce the
 * gate themselves.
 */

// ── Overview ────────────────────────────────────────────────────────

export interface AdminOverview {
  totalUsers: number;
  usersLast7d: number;
  usersLast30d: number;
  stripeOnboardedCount: number;
  stripeOnboardedPct: number;

  activeGiftPages: number;
  pausedGiftPages: number;
  archivedGiftPages: number;

  completedGiftsCount: number;
  completedGiftsGrossCents: number;
  pendingGiftsCount: number;
  failedGiftsCount: number;
  refundedGiftsCount: number;

  sentGiftsCompletedCount: number;
  sentGiftsCompletedGrossCents: number;
  sentGiftsPendingCount: number;

  repeatGiverCount: number;

  signupSeries: { day: string; count: number }[];
  giftSeries: { day: string; count: number; grossCents: number }[];

  recentActivity: AdminActivityEvent[];
}

export type AdminActivityEvent =
  | {
      kind: "user_signup";
      id: string;
      createdAt: string;
      label: string;
      href: string;
    }
  | {
      kind: "gift_page_created";
      id: string;
      createdAt: string;
      label: string;
      href: string;
    }
  | {
      kind: "gift_completed";
      id: string;
      createdAt: string;
      amountCents: number;
      label: string;
      href: string;
    }
  | {
      kind: "sent_gift_completed";
      id: string;
      createdAt: string;
      amountCents: number;
      label: string;
      href: string;
    };

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Bucket an array of ISO timestamps into a dense day-by-day series covering
 * the last `days` days (UTC). Returned oldest-first so it renders
 * left-to-right on a timeline.
 */
function bucketByDay(
  isoTimestamps: { createdAt: string; amountCents?: number }[],
  days: number
): { day: string; count: number; grossCents: number }[] {
  const buckets = new Map<string, { count: number; grossCents: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { count: 0, grossCents: 0 });
  }
  for (const t of isoTimestamps) {
    const key = t.createdAt.slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.count++;
      b.grossCents += t.amountCents ?? 0;
    }
  }
  return Array.from(buckets.entries()).map(([day, v]) => ({
    day,
    count: v.count,
    grossCents: v.grossCents,
  }));
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdminSession();
  const db = createServerClient();

  const [
    usersAll,
    giftPages,
    gifts,
    sentGifts,
    giverEmails,
  ] = await Promise.all([
    db.from("users").select("id, email, stripe_onboarded, created_at"),
    db.from("gift_pages").select("id, status, created_at, child_name, slug"),
    db
      .from("gifts")
      .select("id, amount_cents, status, created_at, gift_page_id, giver_name"),
    db
      .from("sent_gifts")
      .select("id, slug, amount_cents, status, created_at, giver_name"),
    db.from("giver_emails").select("gift_count"),
  ]);

  const users = usersAll.data ?? [];
  const pages = giftPages.data ?? [];
  const giftsData = gifts.data ?? [];
  const sentData = sentGifts.data ?? [];
  const givers = giverEmails.data ?? [];

  const now = Date.now();
  const cutoff7 = now - 7 * 24 * 60 * 60 * 1000;
  const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;

  const totalUsers = users.length;
  const usersLast7d = users.filter(
    (u) => new Date(u.created_at).getTime() >= cutoff7
  ).length;
  const usersLast30d = users.filter(
    (u) => new Date(u.created_at).getTime() >= cutoff30
  ).length;
  const stripeOnboardedCount = users.filter((u) => u.stripe_onboarded).length;
  const stripeOnboardedPct =
    totalUsers > 0 ? Math.round((stripeOnboardedCount / totalUsers) * 100) : 0;

  const activeGiftPages = pages.filter((p) => p.status === "active").length;
  const pausedGiftPages = pages.filter((p) => p.status === "paused").length;
  const archivedGiftPages = pages.filter((p) => p.status === "archived").length;

  const completedGifts = giftsData.filter((g) => g.status === "completed");
  const completedGiftsCount = completedGifts.length;
  const completedGiftsGrossCents = completedGifts.reduce(
    (sum, g) => sum + g.amount_cents,
    0
  );
  const pendingGiftsCount = giftsData.filter(
    (g) => g.status === "pending"
  ).length;
  const failedGiftsCount = giftsData.filter(
    (g) => g.status === "failed"
  ).length;
  const refundedGiftsCount = giftsData.filter(
    (g) => g.status === "refunded"
  ).length;

  const sentCompleted = sentData.filter((s) => s.status === "completed");
  const sentGiftsCompletedCount = sentCompleted.length;
  const sentGiftsCompletedGrossCents = sentCompleted.reduce(
    (sum, s) => sum + s.amount_cents,
    0
  );
  const sentGiftsPendingCount = sentData.filter(
    (s) => s.status === "pending"
  ).length;

  const repeatGiverCount = givers.filter((g) => (g.gift_count ?? 0) > 1).length;

  // 30-day signup series
  const signupBuckets = bucketByDay(
    users.map((u) => ({ createdAt: u.created_at })),
    30
  );
  const signupSeries = signupBuckets.map(({ day, count }) => ({ day, count }));

  // 30-day gift volume series (completed gifts + completed sent_gifts)
  const giftBuckets = bucketByDay(
    [
      ...completedGifts.map((g) => ({
        createdAt: g.created_at,
        amountCents: g.amount_cents,
      })),
      ...sentCompleted.map((s) => ({
        createdAt: s.created_at,
        amountCents: s.amount_cents,
      })),
    ],
    30
  );
  const giftSeries = giftBuckets;

  // Recent activity: merge several streams, take 20 most recent
  const pageById = new Map(pages.map((p) => [p.id, p]));

  const events: AdminActivityEvent[] = [
    ...users.slice(0, 30).map(
      (u): AdminActivityEvent => ({
        kind: "user_signup",
        id: u.id,
        createdAt: u.created_at,
        label: u.email,
        href: `/admin/users/${u.id}`,
      })
    ),
    ...pages.slice(0, 30).map(
      (p): AdminActivityEvent => ({
        kind: "gift_page_created",
        id: p.id,
        createdAt: p.created_at,
        label: p.child_name,
        href: `/gift/${p.slug}`,
      })
    ),
    ...completedGifts.slice(0, 30).map((g): AdminActivityEvent => {
      const page = pageById.get(g.gift_page_id);
      return {
        kind: "gift_completed",
        id: g.id,
        createdAt: g.created_at,
        amountCents: g.amount_cents,
        label: `${g.giver_name ?? "Someone"} → ${page?.child_name ?? "—"}`,
        href: page ? `/gift/${page.slug}` : "/admin/gifts",
      };
    }),
    ...sentCompleted.slice(0, 30).map(
      (s): AdminActivityEvent => ({
        kind: "sent_gift_completed",
        id: s.id,
        createdAt: s.created_at,
        amountCents: s.amount_cents,
        label: `${s.giver_name ?? "Someone"} (sent gift)`,
        href: `/g/${s.slug}`,
      })
    ),
  ];
  events.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    totalUsers,
    usersLast7d,
    usersLast30d,
    stripeOnboardedCount,
    stripeOnboardedPct,
    activeGiftPages,
    pausedGiftPages,
    archivedGiftPages,
    completedGiftsCount,
    completedGiftsGrossCents,
    pendingGiftsCount,
    failedGiftsCount,
    refundedGiftsCount,
    sentGiftsCompletedCount,
    sentGiftsCompletedGrossCents,
    sentGiftsPendingCount,
    repeatGiverCount,
    signupSeries,
    giftSeries,
    recentActivity: events.slice(0, 20),
  };
}

// ── Users ────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  createdAt: string;
  giftPageCount: number;
  giftsReceivedCount: number;
  giftsReceivedGrossCents: number;
}

export async function listUsers(opts: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ rows: AdminUserRow[]; total: number }> {
  await requireAdminSession();
  const db = createServerClient();
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const q = opts.q?.trim();

  let query = db
    .from("users")
    .select(
      "id, email, name, image, stripe_account_id, stripe_onboarded, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    // Supabase "or" accepts a comma-joined list of filter expressions.
    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data: users, count } = await query;
  const userList = users ?? [];
  if (userList.length === 0) {
    return { rows: [], total: count ?? 0 };
  }

  const userIds = userList.map((u) => u.id);

  // Gift pages owned by these users, + their completed gifts
  const [{ data: pages }, { data: gifts }] = await Promise.all([
    db
      .from("gift_pages")
      .select("id, user_id")
      .in("user_id", userIds)
      .neq("status", "archived"),
    db
      .from("gifts")
      .select("gift_page_id, amount_cents, status")
      .eq("status", "completed"),
  ]);

  const pagesByUser = new Map<string, string[]>();
  for (const p of pages ?? []) {
    const arr = pagesByUser.get(p.user_id) ?? [];
    arr.push(p.id);
    pagesByUser.set(p.user_id, arr);
  }

  const pageToUser = new Map<string, string>();
  for (const [userId, ids] of pagesByUser.entries()) {
    for (const id of ids) pageToUser.set(id, userId);
  }

  const perUser = new Map<string, { count: number; gross: number }>();
  for (const g of gifts ?? []) {
    const userId = pageToUser.get(g.gift_page_id);
    if (!userId) continue;
    const prev = perUser.get(userId) ?? { count: 0, gross: 0 };
    prev.count++;
    prev.gross += g.amount_cents;
    perUser.set(userId, prev);
  }

  const rows: AdminUserRow[] = userList.map((u) => {
    const agg = perUser.get(u.id);
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image,
      stripeAccountId: u.stripe_account_id,
      stripeOnboarded: !!u.stripe_onboarded,
      createdAt: u.created_at,
      giftPageCount: pagesByUser.get(u.id)?.length ?? 0,
      giftsReceivedCount: agg?.count ?? 0,
      giftsReceivedGrossCents: agg?.gross ?? 0,
    };
  });

  return { rows, total: count ?? 0 };
}

export interface AdminUserDetail {
  user: AdminUserRow;
  giftPages: {
    id: string;
    slug: string;
    childName: string;
    eventName: string;
    fundTicker: string;
    fundName: string;
    status: string;
    totalRaisedCents: number;
    giftCount: number;
    createdAt: string;
  }[];
  recentGifts: {
    id: string;
    giverName: string;
    giverEmail: string;
    amountCents: number;
    status: string;
    stripePaymentId: string | null;
    createdAt: string;
    giftPageSlug: string;
    giftPageChildName: string;
  }[];
  incomingSentGifts: {
    id: string;
    slug: string;
    giverName: string;
    giverEmail: string;
    childName: string;
    occasion: string;
    amountCents: number;
    status: string;
    createdAt: string;
  }[];
}

export async function getUserDetail(
  id: string
): Promise<AdminUserDetail | null> {
  await requireAdminSession();
  const db = createServerClient();

  const { data: u } = await db
    .from("users")
    .select(
      "id, email, name, image, stripe_account_id, stripe_onboarded, created_at"
    )
    .eq("id", id)
    .single();
  if (!u) return null;

  const { data: pages } = await db
    .from("gift_pages")
    .select(
      "id, slug, child_name, event_name, fund_ticker, fund_name, status, created_at"
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });
  const pageList = pages ?? [];
  const pageIds = pageList.map((p) => p.id);

  const [{ data: pageGifts }, { data: recentGiftsRaw }, { data: sentRaw }] =
    await Promise.all([
      pageIds.length > 0
        ? db
            .from("gifts")
            .select("gift_page_id, amount_cents, status")
            .in("gift_page_id", pageIds)
        : Promise.resolve({ data: [] as { gift_page_id: string; amount_cents: number; status: string }[] }),
      pageIds.length > 0
        ? db
            .from("gifts")
            .select(
              "id, gift_page_id, giver_name, giver_email, amount_cents, status, stripe_payment_id, created_at"
            )
            .in("gift_page_id", pageIds)
            .order("created_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [] }),
      db
        .from("sent_gifts")
        .select(
          "id, slug, giver_name, giver_email, child_name, occasion, amount_cents, status, created_at"
        )
        .eq("recipient_email", u.email)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const pageTotals = new Map<string, { total: number; count: number }>();
  for (const g of pageGifts ?? []) {
    if (g.status !== "completed") continue;
    const prev = pageTotals.get(g.gift_page_id) ?? { total: 0, count: 0 };
    prev.total += g.amount_cents;
    prev.count++;
    pageTotals.set(g.gift_page_id, prev);
  }

  const giftPages = pageList.map((p) => {
    const agg = pageTotals.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      childName: p.child_name,
      eventName: p.event_name,
      fundTicker: p.fund_ticker,
      fundName: p.fund_name,
      status: p.status,
      totalRaisedCents: agg?.total ?? 0,
      giftCount: agg?.count ?? 0,
      createdAt: p.created_at,
    };
  });

  const pageById = new Map(pageList.map((p) => [p.id, p]));
  const recentGifts =
    (recentGiftsRaw ?? []).map((g) => {
      const p = pageById.get(g.gift_page_id);
      return {
        id: g.id,
        giverName: g.giver_name,
        giverEmail: g.giver_email,
        amountCents: g.amount_cents,
        status: g.status,
        stripePaymentId: g.stripe_payment_id,
        createdAt: g.created_at,
        giftPageSlug: p?.slug ?? "",
        giftPageChildName: p?.child_name ?? "—",
      };
    });

  const incomingSentGifts = (sentRaw ?? []).map((s) => ({
    id: s.id,
    slug: s.slug,
    giverName: s.giver_name,
    giverEmail: s.giver_email,
    childName: s.child_name,
    occasion: s.occasion,
    amountCents: s.amount_cents,
    status: s.status,
    createdAt: s.created_at,
  }));

  return {
    user: {
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image,
      stripeAccountId: u.stripe_account_id,
      stripeOnboarded: !!u.stripe_onboarded,
      createdAt: u.created_at,
      giftPageCount: pageList.length,
      giftsReceivedCount: recentGifts.filter((g) => g.status === "completed")
        .length,
      giftsReceivedGrossCents: recentGifts
        .filter((g) => g.status === "completed")
        .reduce((sum, g) => sum + g.amountCents, 0),
    },
    giftPages,
    recentGifts,
    incomingSentGifts,
  };
}

// ── Gift pages (all) ─────────────────────────────────────────────────

export interface AdminGiftPageRow {
  id: string;
  slug: string;
  childName: string;
  eventName: string;
  fundTicker: string;
  fundName: string;
  status: string;
  createdAt: string;
  ownerId: string;
  ownerEmail: string | null;
  ownerName: string | null;
  totalRaisedCents: number;
  giftCount: number;
}

export async function listGiftPages(opts: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ rows: AdminGiftPageRow[]; total: number }> {
  await requireAdminSession();
  const db = createServerClient();
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  let query = db
    .from("gift_pages")
    .select(
      "id, slug, user_id, child_name, event_name, fund_ticker, fund_name, status, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (opts.status) query = query.eq("status", opts.status);

  const { data: pages, count } = await query;
  const pageList = pages ?? [];
  if (pageList.length === 0) return { rows: [], total: count ?? 0 };

  const pageIds = pageList.map((p) => p.id);
  const ownerIds = Array.from(new Set(pageList.map((p) => p.user_id)));

  const [{ data: gifts }, { data: owners }] = await Promise.all([
    db
      .from("gifts")
      .select("gift_page_id, amount_cents, status")
      .in("gift_page_id", pageIds),
    db.from("users").select("id, email, name").in("id", ownerIds),
  ]);

  const ownerById = new Map(
    (owners ?? []).map((o) => [o.id, { email: o.email, name: o.name }])
  );
  const totalsByPage = new Map<string, { total: number; count: number }>();
  for (const g of gifts ?? []) {
    if (g.status !== "completed") continue;
    const prev = totalsByPage.get(g.gift_page_id) ?? { total: 0, count: 0 };
    prev.total += g.amount_cents;
    prev.count++;
    totalsByPage.set(g.gift_page_id, prev);
  }

  const rows: AdminGiftPageRow[] = pageList.map((p) => {
    const owner = ownerById.get(p.user_id);
    const agg = totalsByPage.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      childName: p.child_name,
      eventName: p.event_name,
      fundTicker: p.fund_ticker,
      fundName: p.fund_name,
      status: p.status,
      createdAt: p.created_at,
      ownerId: p.user_id,
      ownerEmail: owner?.email ?? null,
      ownerName: owner?.name ?? null,
      totalRaisedCents: agg?.total ?? 0,
      giftCount: agg?.count ?? 0,
    };
  });

  return { rows, total: count ?? 0 };
}

// ── Unified gifts list (gifts + sent_gifts) ──────────────────────────

export type AdminGiftSource = "gift" | "sent_gift";

export interface AdminGiftRow {
  id: string;
  source: AdminGiftSource;
  amountCents: number;
  giverName: string;
  giverEmail: string;
  recipientLabel: string;
  status: string;
  stripePaymentId: string | null;
  createdAt: string;
  href: string;
  /** true iff this is a gift-page donation whose parent has Stripe Connect
   *  active — a refund must reverse the transfer as well. Always false for
   *  sent_gifts (platform-only charges in Phase 1). */
  isDestinationCharge: boolean;
}

export async function listAllGifts(opts: {
  source?: AdminGiftSource;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ rows: AdminGiftRow[]; total: number }> {
  await requireAdminSession();
  const db = createServerClient();
  const limit = opts.limit ?? 50;

  const wantGifts = opts.source !== "sent_gift";
  const wantSent = opts.source !== "gift";

  const [giftsRes, sentRes] = await Promise.all([
    wantGifts
      ? (async () => {
          let q = db
            .from("gifts")
            .select(
              "id, gift_page_id, amount_cents, giver_name, giver_email, status, stripe_payment_id, created_at",
              { count: "exact" }
            );
          if (opts.status) q = q.eq("status", opts.status);
          q = q.order("created_at", { ascending: false }).limit(200);
          return q;
        })()
      : Promise.resolve({ data: [], count: 0 }),
    wantSent
      ? (async () => {
          let q = db
            .from("sent_gifts")
            .select(
              "id, slug, amount_cents, giver_name, giver_email, child_name, occasion, recipient_email, status, stripe_payment_id, created_at",
              { count: "exact" }
            );
          if (opts.status) q = q.eq("status", opts.status);
          q = q.order("created_at", { ascending: false }).limit(200);
          return q;
        })()
      : Promise.resolve({ data: [], count: 0 }),
  ]);

  const giftRows = giftsRes.data ?? [];
  const sentRows = sentRes.data ?? [];

  // Look up page info for gift rows so we can render a recipient label + detect
  // whether the associated parent is Stripe-Connect onboarded (controls refund
  // strategy).
  const giftPageIds = Array.from(
    new Set(giftRows.map((g) => g.gift_page_id).filter(Boolean))
  );
  const { data: pages } = giftPageIds.length
    ? await db
        .from("gift_pages")
        .select(
          "id, slug, child_name, event_name, user_id, users!inner(stripe_account_id, stripe_onboarded)"
        )
        .in("id", giftPageIds)
    : { data: [] };

  type JoinedPage = {
    id: string;
    slug: string;
    child_name: string;
    event_name: string;
    user_id: string;
    users:
      | { stripe_account_id: string | null; stripe_onboarded: boolean | null }
      | { stripe_account_id: string | null; stripe_onboarded: boolean | null }[]
      | null;
  };
  const pageById = new Map(
    ((pages ?? []) as JoinedPage[]).map((p) => {
      const ownerRaw = p.users;
      const owner = Array.isArray(ownerRaw) ? ownerRaw[0] : ownerRaw;
      const isDestinationCharge = !!(
        owner?.stripe_onboarded && owner?.stripe_account_id
      );
      return [
        p.id,
        {
          slug: p.slug,
          childName: p.child_name,
          eventName: p.event_name,
          isDestinationCharge,
        },
      ];
    })
  );

  const unified: AdminGiftRow[] = [
    ...giftRows.map((g): AdminGiftRow => {
      const p = pageById.get(g.gift_page_id);
      return {
        id: g.id,
        source: "gift",
        amountCents: g.amount_cents,
        giverName: g.giver_name,
        giverEmail: g.giver_email,
        recipientLabel: p
          ? `${p.childName} · ${p.eventName}`
          : "—",
        status: g.status,
        stripePaymentId: g.stripe_payment_id,
        createdAt: g.created_at,
        href: p ? `/gift/${p.slug}` : "/admin/gifts",
        isDestinationCharge: p?.isDestinationCharge ?? false,
      };
    }),
    ...sentRows.map(
      (s): AdminGiftRow => ({
        id: s.id,
        source: "sent_gift",
        amountCents: s.amount_cents,
        giverName: s.giver_name,
        giverEmail: s.giver_email,
        recipientLabel: `${s.child_name} · ${s.occasion} → ${s.recipient_email}`,
        status: s.status,
        stripePaymentId: s.stripe_payment_id,
        createdAt: s.created_at,
        href: `/g/${s.slug}`,
        isDestinationCharge: false,
      })
    ),
  ];

  unified.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const offset = opts.offset ?? 0;
  const sliced = unified.slice(offset, offset + limit);

  return {
    rows: sliced,
    total: unified.length,
  };
}

// ── Audit log ────────────────────────────────────────────────────────

export interface AdminAuditRow {
  id: string;
  adminEmail: string;
  action: string;
  subjectType: string | null;
  subjectId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export async function listAuditEvents(opts: {
  limit?: number;
  offset?: number;
}): Promise<{ rows: AdminAuditRow[]; total: number }> {
  await requireAdminSession();
  const db = createServerClient();
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;

  const { data, count } = await db
    .from("admin_audit")
    .select("id, admin_email, action, subject_type, subject_id, metadata, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  type Raw = {
    id: string;
    admin_email: string;
    action: string;
    subject_type: string | null;
    subject_id: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  };

  const rows: AdminAuditRow[] = (data ?? []).map((r: Raw) => ({
    id: r.id,
    adminEmail: r.admin_email,
    action: r.action,
    subjectType: r.subject_type,
    subjectId: r.subject_id,
    metadata: r.metadata,
    createdAt: r.created_at,
  }));

  return { rows, total: count ?? 0 };
}

// ── Stripe ───────────────────────────────────────────────────────────

export interface StripeOverview {
  balance: {
    available: { amount: number; currency: string }[];
    pending: { amount: number; currency: string }[];
  } | null;
  recentCharges:
    | {
        id: string;
        amount: number;
        currency: string;
        status: string;
        created: number; // unix seconds
        description: string | null;
        metadataKind: string | null;
        receiptUrl: string | null;
      }[]
    | null;
  error: string | null;
}

export async function getStripeOverview(): Promise<StripeOverview> {
  await requireAdminSession();
  const stripe = getStripe();

  try {
    const [balance, charges] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.charges.list({ limit: 20 }),
    ]);

    return {
      balance: {
        available: balance.available.map((a) => ({
          amount: a.amount,
          currency: a.currency,
        })),
        pending: balance.pending.map((p) => ({
          amount: p.amount,
          currency: p.currency,
        })),
      },
      recentCharges: charges.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        created: c.created,
        description: c.description,
        metadataKind: (c.metadata?.kind as string | undefined) ?? null,
        receiptUrl: c.receipt_url,
      })),
      error: null,
    };
  } catch (err) {
    return {
      balance: null,
      recentCharges: null,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error fetching Stripe data",
    };
  }
}
