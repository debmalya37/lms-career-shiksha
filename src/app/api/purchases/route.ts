// app/api/purchases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/user';

export async function GET(req: NextRequest) {
  await dbConnect();
  const sessionToken = req.cookies.get('sessionToken')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await User.findOne({ sessionToken })
    .populate('purchaseHistory.course', 'title')  // populate course title
    .lean();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ purchaseHistory: user.purchaseHistory });
}
