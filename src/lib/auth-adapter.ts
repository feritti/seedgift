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
    async getUserByAccount() {
      return null;
    },
    async updateUser(user) {
      return user as AdapterUser;
    },
    async deleteUser() {},
    async linkAccount() {
      return undefined;
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
