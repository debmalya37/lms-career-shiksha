// app/api/oauth/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createOAuthClient } from '@/lib/googleClient'

export async function GET(req: NextRequest) {
  // 1) build OAuth2 client exactly as before
  const oAuth2 = createOAuthClient()

  // 2) generate the consent URL
  const url = oAuth2.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl'],
    // you can also pass `prompt: 'consent'` here if you want to force reconsent
  })

  // 3) redirect the browser to Google's OAuth2 consent screen
  return NextResponse.redirect(url)
}
