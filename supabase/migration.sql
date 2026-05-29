-- URL Shortener DB Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/<your-project>/sql

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS links (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text        NOT NULL,
  slug          text        NOT NULL UNIQUE,
  original_url  text        NOT NULL,
  title         text,
  is_active     boolean     NOT NULL DEFAULT true,
  password_hash text,
  expires_at    timestamptz,
  max_clicks    integer,
  click_count   integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS click_events (
  id          bigserial   PRIMARY KEY,
  link_id     uuid        NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  slug        text        NOT NULL,
  clicked_at  timestamptz NOT NULL DEFAULT now(),
  ip_hash     text,
  country     text,
  city        text,
  referrer    text,
  device_type text,
  browser     text,
  os          text
);

CREATE TABLE IF NOT EXISTS api_keys (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text        NOT NULL,
  name         text        NOT NULL,
  key_hash     text        NOT NULL UNIQUE,
  key_prefix   text        NOT NULL,
  last_used_at timestamptz,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS links_user_id_created_at_idx
  ON links (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS click_events_link_id_clicked_at_idx
  ON click_events (link_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS click_events_link_id_ip_hash_idx
  ON click_events (link_id, ip_hash);

CREATE INDEX IF NOT EXISTS click_events_clicked_at_idx
  ON click_events (clicked_at DESC);

CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx
  ON api_keys (key_hash);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx
  ON api_keys (user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Atomic click count increment used by analytics tracker
CREATE OR REPLACE FUNCTION increment_click_count(link_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE links SET click_count = click_count + 1 WHERE id = link_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
