// src/app/api/user/purchase/route.ts
import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txn = searchParams.get('transactionId');
  if (!txn) {
    return NextResponse.json({ error: 'transactionId required' }, { status: 400 });
  }

  await connectMongo();
  // You may also want to look up by sessionToken if you want to restrict it to current user
  // const token = req.cookies.get('sessionToken')?.value;
  const user = await User.findOne({ 'purchaseHistory.transactionId': txn }).lean();
  if (!user) {
    return NextResponse.json({ amount: null, found: false });
  }
  const rec = user.purchaseHistory.find(r => r.transactionId === txn);
  return NextResponse.json({
    found: Boolean(rec),
    amount: rec ? rec.amount : null
  });
}
