// app/api/admission/route.ts
import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/lib/db';
import Admission from '@/models/admissionModel';

export async function GET(req: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  const query: any = {};
  if (email) {
    query.email = email;
  }

  try {
    const admissions = await Admission.find(query)
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(admissions);
  } catch (err: any) {
    console.error("Failed to fetch admissions:", err);
    return NextResponse.json(
      { error: 'Could not fetch admissions' },
      { status: 500 }
    );
  }
}
