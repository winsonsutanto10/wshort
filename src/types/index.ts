export type LinkRow = {
  id: string
  user_id: string
  slug: string
  original_url: string
  title: string | null
  is_active: boolean
  password_hash: string | null
  expires_at: string | null
  max_clicks: number | null
  click_count: number
  created_at: string
  updated_at: string
}

export type CreateLinkInput = {
  url: string
  slug?: string
  title?: string
  password?: string
  expires_at?: string
  max_clicks?: number
}

export type UpdateLinkInput = {
  title?: string
  original_url?: string
  is_active?: boolean
  expires_at?: string | null
  max_clicks?: number | null
}

export type RedisSlugValue = {
  originalUrl: string
  linkId: string
  hasPassword: boolean
  expiresAt: number
  maxClicks: number
}
