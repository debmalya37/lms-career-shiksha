// app/api/meet/create/route.ts

import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

const SCOPES = ['https://www.googleapis.com/auth/meetings.space.created'];

export async function POST() {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_SA_CLIENT_EMAIL or GOOGLE_SA_PRIVATE_KEY' },
      { status: 500 }
    );
  }

  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    const token = await authClient.getAccessToken();

    const response = await fetch('https://meetings.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId: uuidv4(), // ✅ Required field
        spaceType: 'MEETING_SPACE', // Optional but good to be explicit
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Google Meet API error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ meetingUri: data.meetingUri });
  } catch (error: any) {
    console.error('Meet creation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
