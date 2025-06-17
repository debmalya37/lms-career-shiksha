// app/api/invoices/me/route.ts

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Invoice from '@/models/invoiceModel';
import { User } from '@/models/user';

export async function GET(request: NextRequest) {
  await connectMongo();

  // const cookieStore = cookies();
  const sessionToken = request.cookies.get('sessionToken')?.value;

console.log('Session Token:', sessionToken); // Debugging line to check session token
const user = await User.findOne({ sessionToken }).lean();
const email = user?.email;
  console.log('User Email:', email); // Debugging line to check user email
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
  }

  try {
    // const email = sessionToken; // ← using email directly as sessionToken (per your setup)
    
    const invoices = await Invoice.find({ email }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ invoices });
  } catch (err) {
    console.error('Error fetching user invoices:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
