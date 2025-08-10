import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful auth - redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    } else {
      console.error('Auth exchange error:', error)
      return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
    }
  }

  // No code parameter - redirect to signin
  return NextResponse.redirect(`${origin}/auth/signin?error=no_code`)
}
