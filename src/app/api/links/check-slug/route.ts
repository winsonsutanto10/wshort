import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateSlug } from '@/lib/slug'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ available: false }, { status: 401 })

  const slug = new URL(request.url).searchParams.get('slug') ?? ''
  const validation = validateSlug(slug)
  if (!validation.valid) {
    return NextResponse.json({ available: false, error: validation.error })
  }

  const { data } = await supabaseAdmin
    .from('links')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
