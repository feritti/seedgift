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

-- Deduplicated marketing email list
CREATE TABLE IF NOT EXISTS giver_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_gift_at TIMESTAMPTZ DEFAULT NOW(),
  gift_count INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_pages_user_id ON gift_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_pages_slug ON gift_pages(slug);
CREATE INDEX IF NOT EXISTS idx_gifts_gift_page_id ON gifts(gift_page_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);

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
