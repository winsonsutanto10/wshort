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

export type ClickEventRow = {
  id: number
  link_id: string
  slug: string
  clicked_at: string
  ip_hash: string | null
  country: string | null
  city: string | null
  referrer: string | null
  device_type: string | null
  browser: string | null
  os: string | null
}

export type ApiKeyRow = {
  id: string
  user_id: string
  name: string
  key_hash: string
  key_prefix: string
  last_used_at: string | null
  is_active: boolean
  created_at: string
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

export type AnalyticsTimeSeriesPoint = {
  date: string
  clicks: number
  unique_visitors: number
}

export type AnalyticsBreakdown = {
  label: string
  count: number
  percentage: number
}

export type LinkAnalytics = {
  total_clicks: number
  unique_visitors: number
  time_series: AnalyticsTimeSeriesPoint[]
  by_country: AnalyticsBreakdown[]
  by_device: AnalyticsBreakdown[]
  by_browser: AnalyticsBreakdown[]
  by_referrer: AnalyticsBreakdown[]
}

export type RedisSlugValue = {
  originalUrl: string
  linkId: string
  hasPassword: boolean
  expiresAt: number
  maxClicks: number
}
