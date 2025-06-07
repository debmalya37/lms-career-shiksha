// app/api/promocode/apply/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import PromoCode from "@/models/promoCodeModel";
import Course from "@/models/courseModel";

export async function POST(req: Request) {
  await connectMongo();
  const { code, courseId } = await req.json();

  if (!code || !courseId) {
    return NextResponse.json(
      { error: "Missing code or courseId" },
      { status: 400 }
    );
  }

  // 1) Find the promo
  const promo = await PromoCode.findOne({ code });
  if (!promo) {
    return NextResponse.json(
      { error: "Invalid promo code" },
      { status: 404 }
    );
  }

  // 2) Check expiry / usage limits
  if (promo.expiresAt < new Date() || promo.usedCount >= promo.usageLimit) {
    return NextResponse.json(
      { error: "Promo expired or usage limit reached" },
      { status: 400 }
    );
  }

  // 3) Enforce course specificity: if applicableCourses is non-empty,
  //    the current courseId must be in that list.
  if (
    Array.isArray(promo.applicableCourses) &&
    promo.applicableCourses.length > 0 &&
    !promo.applicableCourses.some((c:any) => c.toString() === courseId)
  ) {
    return NextResponse.json(
      { error: "Promo code not valid for this course" },
      { status: 400 }
    );
  }

  // 4) Fetch course to get its discountedPrice
  const course = await Course.findById(courseId).lean<{
    discountedPrice?: number;
  }>();
  if (!course) {
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 }
    );
  }

  // 5) Compute the final price
  let finalPrice = course.discountedPrice ?? 0;
  if (promo.discountType === "percentage") {
    finalPrice = finalPrice * (1 - promo.discountValue / 100);
  } else {
    finalPrice = finalPrice - promo.discountValue;
  }
  finalPrice = Math.max(0, Math.round(finalPrice * 100) / 100);

  // 6) Increment usage count
  promo.usedCount++;
  await promo.save();

  // 7) Return the result
  return NextResponse.json({
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    finalPrice,
  });
}
