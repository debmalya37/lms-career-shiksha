// app/api/create-channel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

export async function POST(request: NextRequest) {
  try {
    const { channelId } = await request.json();
    if (!channelId) {
      return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
    }

    const serverClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    );

    // cast your channelData so TS will allow "name"
    const channel = serverClient.channel(
      'livestream',
      channelId,
      { name: 'Live Class Chat' } as any
    );

    await channel.create();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('create-channel error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
