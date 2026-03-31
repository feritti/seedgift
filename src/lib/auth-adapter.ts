/**
 * Minimal NextAuth adapter that ONLY handles verification tokens.
 * We manage users ourselves in the signIn callback — this adapter
 * just stores/retrieves magic-link tokens in Supabase.
 */
import type { Adapter, AdapterUser } from "@auth/core/adapters";
import { createServerClient } from "@/lib/db";

export function VerificationTokenAdapter(): Adapter {
  return {
    // -- Verification tokens (the only thing we actually need) ----------
    async createVerificationToken(token) {
      const db = createServerClient();
      const { data, error } = await db
        .from("verification_tokens")
        .insert({
          identifier: token.identifier,
          token: token.token,
          expires: token.expires.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("[auth-adapter] createVerificationToken error:", error);
        throw error;
      }
      return { ...data, expires: new Date(data.expires) };
    },

    async useVerificationToken({ identifier, token }) {
      const db = createServerClient();
      const { data, error } = await db
        .from("verification_tokens")
        .delete()
        .eq("identifier", identifier)
        .eq("token", token)
        .select()
        .single();

      if (error) {
        console.error("[auth-adapter] useVerificationToken error:", error);
        return null;
      }
      return data ? { ...data, expires: new Date(data.expires) } : null;
    },

    // -- Stubs for user management (we handle this in signIn callback) ---
    async createUser(user) {
      return { ...user, id: user.email ?? crypto.randomUUID(), emailVerified: null } as AdapterUser;
    },
    async getUser(_id) {
      return null;
    },
    async getUserByEmail(email) {
      // Return a minimal user so NextAuth proceeds with the magic link flow
      if (!email) return null;
      const db = createServerClient();
      const { data } = await db
        .from("users")
        .select("id, email, name, image")
        .eq("email", email)
        .single();

      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        emailVerified: new Date(),
      } as AdapterUser;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const db = createServerClient();
      const { data: account } = await db
        .from("accounts")
        .select("user_id")
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId)
        .single();

      if (!account) return null;

      const { data: user } = await db
        .from("users")
        .select("id, email, name, image")
        .eq("id", account.user_id)
        .single();

      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: new Date(),
      } as AdapterUser;
    },
    async updateUser(user) {
      return user as AdapterUser;
    },
    async deleteUser() {},
    async linkAccount(account) {
      const db = createServerClient();
      await db.from("accounts").insert({
        user_id: account.userId,
        type: account.type,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        refresh_token: account.refresh_token ?? null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
      });
      return account;
    },
    async unlinkAccount() {},
    async createSession() {
      return { sessionToken: "", userId: "", expires: new Date() };
    },
    async getSessionAndUser() {
      return null;
    },
    async updateSession() {
      return null;
    },
    async deleteSession() {},
  };
}
