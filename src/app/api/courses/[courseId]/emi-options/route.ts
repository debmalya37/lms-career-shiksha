// /api/courses/[courseId]/emi-options/route.ts
import { NextRequest, NextResponse } from "next/server";
import Course from "@/models/courseModel";
import dbConnect from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await dbConnect();
    
    const { courseId } = params;
    
    const course = await Course.findById(courseId)
      .select('title emiEnabled emiPrice emiOptions emiProcessingFeePercentage emiMinimumAmount discountedPrice');

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course EMI options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch EMI options' },
      { status: 500 }
    );
  }
}