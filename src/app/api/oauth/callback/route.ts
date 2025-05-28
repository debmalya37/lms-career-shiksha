// app/api/oauth/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createOAuthClient } from '@/lib/googleClient'

export async function GET(req: NextRequest) {
  // 1) instantiate your OAuth2 client
  const oAuth2 = createOAuthClient()

  // 2) generate the Google OAuth2 consent URL
  const authUrl = oAuth2.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl'],
  })

  // 3) redirect the browser to Google's OAuth2 consent screen
  return NextResponse.redirect(authUrl)
}
