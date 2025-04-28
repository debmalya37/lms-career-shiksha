import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import PromoCode from '@/models/promoCodeModel';
import Course from '@/models/courseModel';

export async function POST(req: Request) {
  await connectMongo();
  const { code, courseId } = await req.json();
  if (!code || !courseId) {
    return NextResponse.json({ error: 'Missing code or courseId' }, { status: 400 });
  }

  const promo = await PromoCode.findOne({ code });
  if (!promo) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
  }
  if (promo.expiresAt < new Date() || promo.usedCount >= promo.usageLimit) {
    return NextResponse.json({ error: 'Code expired or usage limit reached' }, { status: 400 });
  }

  const course = await Course.findById(courseId).lean() as { discountedPrice?: number } | null;
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // compute discounted price
  let finalPrice = course?.discountedPrice ?? 0;
  if (promo.discountType === 'percentage') {
    finalPrice = finalPrice * (1 - promo.discountValue/100);
  } else {
    finalPrice = finalPrice - promo.discountValue;
  }
  finalPrice = Math.max(0, Math.round(finalPrice*100)/100);

  // increment usage
  promo.usedCount++;
  await promo.save();

  return NextResponse.json({
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    finalPrice
  });
}
