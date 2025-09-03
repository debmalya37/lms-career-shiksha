// /api/admin/courses/[courseId]/emi/route.ts
import { NextRequest, NextResponse } from "next/server";
import Course from "@/models/courseModel";
import dbConnect from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await dbConnect();
    
    const { courseId } = params;
    const { emiEnabled } = await request.json();

    const course = await Course.findByIdAndUpdate(
      courseId,
      { emiEnabled },
      { new: true }
    );

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
    console.error('Error updating EMI status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update EMI status' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await dbConnect();
    
    const { courseId } = params;
    const { 
      emiPrice, 
      emiOptions, 
      emiProcessingFeePercentage, 
      emiMinimumAmount 
    } = await request.json();

    // Validate EMI options
    if (emiOptions && emiOptions.length > 0) {
      for (const option of emiOptions) {
        if (!option.months || option.months < 3 || option.months > 24) {
          return NextResponse.json(
            { success: false, error: 'EMI months must be between 3 and 24' },
            { status: 400 }
          );
        }
        if (!option.monthlyAmount || option.monthlyAmount < 100) {
          return NextResponse.json(
            { success: false, error: 'Monthly amount must be at least ₹100' },
            { status: 400 }
          );
        }
      }
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        emiPrice,
        emiOptions,
        emiProcessingFeePercentage,
        emiMinimumAmount
      },
      { new: true }
    );

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
    console.error('Error updating course EMI settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course EMI settings' },
      { status: 500 }
    );
  }
}