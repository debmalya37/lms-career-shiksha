import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import PromoCode, { IPromoCode } from '@/models/promoCodeModel';

export async function GET() {
  await connectMongo();
  const codes = await PromoCode.find().lean();
  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  await connectMongo();
  const { code, discountType, discountValue, expiresAt, usageLimit } =
    await req.json();
  if (!code || !discountType || !discountValue || !expiresAt || !usageLimit) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    const promo = await PromoCode.create({
      code,
      discountType,
      discountValue,
      expiresAt: new Date(expiresAt),
      usageLimit
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
