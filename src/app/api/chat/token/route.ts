// app/api/chat/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';
import { StreamChat } from 'stream-chat';

export async function GET(request: NextRequest) {
  try {
    // 1) connect to MongoDB
    await connectMongo();

    // 2) read your sessionToken cookie
    const sessionToken = request.cookies.get('sessionToken')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 3) lookup user
    const user = await User.findOne({ sessionToken }).lean();
    if (!user || !user._id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 4) generate Stream Chat token
    const serverClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    );
    const userId = user._id.toString();
    const chatToken = serverClient.createToken(userId);

    // 5) return both id & token
    return NextResponse.json({ userId, chatToken });
  } catch (err: any) {
    console.error('chat token error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
