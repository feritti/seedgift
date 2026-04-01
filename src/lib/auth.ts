import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

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

  const { data: profile } = await supabase
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
