import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createServerClient } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/gift-pages", "/gifts", "/settings"];
      const isProtected = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
    async signIn({ user }) {
      // Sync user to Supabase on every sign-in
      if (user.email) {
        const db = createServerClient();
        await db.from("users").upsert(
          {
            email: user.email,
            name: user.name,
            image: user.image,
          },
          { onConflict: "email" }
        );
      }
      return true;
    },
    async session({ session }) {
      // Attach the Supabase user ID to the session
      if (session.user?.email) {
        const db = createServerClient();
        const { data } = await db
          .from("users")
          .select("id, stripe_account_id, stripe_onboarded")
          .eq("email", session.user.email)
          .single();

        if (data) {
          session.user.id = data.id;
          session.user.stripeAccountId = data.stripe_account_id;
          session.user.stripeOnboarded = data.stripe_onboarded;
        }
      }
      return session;
    },
  },
});
