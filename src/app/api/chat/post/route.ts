// app/api/chat/post/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google, youtube_v3 } from 'googleapis'
import { createOAuthClient } from '@/lib/googleClient'

export async function POST(req: NextRequest) {
  // 1. parse JSON body
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }

  const { liveChatId, message } = body
  if (!liveChatId || !message) {
    return NextResponse.json(
      { error: 'liveChatId & message required' },
      { status: 400 }
    )
  }

  // 2. build OAuth2 client (should read saved tokens internally)
  const oAuth2 = createOAuthClient()

  // 3. build YouTube client
  const youtube = google.youtube({
    version: 'v3',
    auth: oAuth2
  })

  // 4. call liveChatMessages.insert
  try {
    const params: youtube_v3.Params$Resource$Livechatmessages$Insert = {
      part: ['snippet'],
      requestBody: {
        snippet: {
          liveChatId,
          type: 'textMessageEvent',
          textMessageDetails: {
            messageText: message
          }
        }
      }
    }
    const response = await youtube.liveChatMessages.insert(params)
    return NextResponse.json(response.data)
  } catch (err: any) {
    console.error('YouTube chat post error', err)
    return NextResponse.json(
      { error: err.message || 'Failed to post message' },
      { status: 500 }
    )
  }
}
