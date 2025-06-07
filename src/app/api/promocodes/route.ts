// app/api/promocodes/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import PromoCode, { IPromoCode } from '@/models/promoCodeModel';
import { Types } from 'mongoose';

export async function GET() {
  await connectMongo();
  const codes = await PromoCode.find().lean();
  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  await connectMongo();
  const { code, discountType, discountValue, expiresAt, usageLimit, applicableCourses } = await req.json();
  if (!code || !discountType || !discountValue || !expiresAt || !usageLimit) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const courseIds = Array.isArray(applicableCourses)
    ? applicableCourses.map((id: string) => new Types.ObjectId(id))
    : [];

  try {
    const promo = await PromoCode.create({
      code,
      discountType,
      discountValue,
      expiresAt: new Date(expiresAt),
      usageLimit,
      applicableCourses: courseIds,
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
