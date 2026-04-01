import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServerClient as createAdminClient } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "magiclink"
    | "recovery"
    | "email_change"
    | "invite";
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error && data.user) {
      // Check if this is a brand new user — create demo gift page if so
      const admin = createAdminClient();
      const { data: existingUser } = await admin
        .from("users")
        .select("id")
        .eq("email", data.user.email!)
        .single();

      if (existingUser) {
        const { data: pages } = await admin
          .from("gift_pages")
          .select("id")
          .eq("user_id", existingUser.id)
          .limit(1);

        if (!pages || pages.length === 0) {
          const slug = `demo-child-birthday-${Math.random().toString(36).slice(2, 8)}`;
          await admin.from("gift_pages").insert({
            user_id: existingUser.id,
            slug,
            child_name: "Demo Child",
            child_dob: "2022-06-15",
            event_name: "Birthday",
            fund_ticker: "VOO",
            fund_name: "S&P 500 Index",
            status: "active",
          });
        }
      }

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
