// /api/admin/courses/emi/route.ts
import { NextRequest, NextResponse } from "next/server";
import Course from "@/models/courseModel";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    await dbConnect();
    
    const courses = await Course.find({})
      .select('title description price discountedPrice isFree emiEnabled emiPrice emiOptions emiProcessingFeePercentage emiMinimumAmount courseImg')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses for EMI:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}