-- SeedGift Database Schema
-- Run this in Supabase SQL editor to set up the database

-- Users table (synced from Auth.js)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  image TEXT,
  stripe_account_id TEXT,
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift pages (created by parents)
CREATE TABLE IF NOT EXISTS gift_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  child_name TEXT NOT NULL,
  child_photo_url TEXT,
  child_dob DATE,
  event_name TEXT NOT NULL,
  fund_ticker TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gifts (sent by gift-givers)
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_page_id UUID NOT NULL REFERENCES gift_pages(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  giver_name TEXT NOT NULL,
  giver_email TEXT NOT NULL,
  note TEXT,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  thanked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification tokens for magic link authentication (NextAuth adapter)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Deduplicated marketing email list
CREATE TABLE IF NOT EXISTS giver_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_gift_at TIMESTAMPTZ DEFAULT NOW(),
  gift_count INTEGER DEFAULT 1
);

-- Sent gifts (giver-initiated: no gift page required; recipient claims by email later)
CREATE TABLE IF NOT EXISTS sent_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,

  giver_name TEXT NOT NULL,
  giver_email TEXT NOT NULL,

  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  child_name TEXT NOT NULL,
  occasion TEXT NOT NULL,

  amount_cents INTEGER NOT NULL,
  fund_ticker TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  message TEXT,

  stripe_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Claim (Phase 2)
  claimed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  fund_ticker_final TEXT,
  paid_out_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin audit log (append-only record of every admin write action)
CREATE TABLE IF NOT EXISTS admin_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,             -- e.g. 'gift_refunded', 'gift_page_paused', 'export_gifts'
  subject_type TEXT,                -- 'gift' | 'sent_gift' | 'gift_page' | 'user' | null for exports
  subject_id UUID,
  metadata JSONB,                   -- free-form context (amount_cents, stripe_refund_id, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_pages_user_id ON gift_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_pages_slug ON gift_pages(slug);
CREATE INDEX IF NOT EXISTS idx_gifts_gift_page_id ON gifts(gift_page_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON verification_tokens(expires);
CREATE INDEX IF NOT EXISTS idx_sent_gifts_slug ON sent_gifts(slug);
CREATE INDEX IF NOT EXISTS idx_sent_gifts_recipient_email ON sent_gifts(recipient_email);
CREATE INDEX IF NOT EXISTS idx_sent_gifts_status ON sent_gifts(status);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_email ON admin_audit(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_subject ON admin_audit(subject_type, subject_id);

-- Updated at trigger for gift_pages
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER gift_pages_updated_at
  BEFORE UPDATE ON gift_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
