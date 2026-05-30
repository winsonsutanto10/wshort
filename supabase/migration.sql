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

CREATE TABLE IF NOT EXISTS user_settings (
  user_id    text        PRIMARY KEY,
  link_quota integer     NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS links_user_id_created_at_idx
  ON links (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS links_slug_idx
  ON links (slug);

CREATE INDEX IF NOT EXISTS user_settings_user_id_idx
  ON user_settings (user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Atomic click count increment — returns new count so caller can enforce max_clicks
CREATE OR REPLACE FUNCTION increment_click_count(link_id_param uuid)
RETURNS integer AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE links SET click_count = click_count + 1 WHERE id = link_id_param
  RETURNING click_count INTO new_count;
  RETURN COALESCE(new_count, 0);
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

CREATE OR REPLACE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
