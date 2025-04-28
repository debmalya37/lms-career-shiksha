import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/user';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
  
    if (key !== process.env.CRON_SECRET_KEY) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      await dbConnect();
      const result = await User.updateMany(
        { subscription: { $gt: 0 } },
        { $inc: { subscription: -1 } }
      );
      console.log('Subscription days decremented:', result.modifiedCount);
      return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
      console.error('Error updating subscriptions:', error);
      return NextResponse.json({ success: false, error: error });
    }
  }
  