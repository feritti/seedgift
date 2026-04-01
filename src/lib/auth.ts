import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createServerClient as createAdminClient } from "@/lib/db";

export type Session = {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    stripeOnboarded: boolean;
  };
};

/** Cached per-request to avoid redundant Supabase calls in server components */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  // Use admin client to bypass RLS — users table only allows service_role access
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("id, stripe_onboarded")
    .eq("email", user.email)
    .single();

  return {
    user: {
      id: profile?.id ?? user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        null,
      image:
        user.user_metadata?.avatar_url ??
        user.user_metadata?.picture ??
        null,
      stripeOnboarded: profile?.stripe_onboarded ?? false,
    },
  };
});
