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
        // Validate months
        if (!option.months || option.months < 1 || option.months > 24) {
          return NextResponse.json(
            { success: false, error: 'EMI months must be between 1 and 24' },
            { status: 400 }
          );
        }

        // Validate monthly amounts - handle both new (monthlyAmounts array) and old (monthlyAmount) format
        if (Array.isArray(option.monthlyAmounts)) {
          // New format: array of monthly amounts
          if (option.monthlyAmounts.length !== option.months) {
            return NextResponse.json(
              { success: false, error: `Monthly amounts array length (${option.monthlyAmounts.length}) must match number of months (${option.months})` },
              { status: 400 }
            );
          }

          // Validate each monthly amount
          for (let i = 0; i < option.monthlyAmounts.length; i++) {
            const amount = option.monthlyAmounts[i];
            if (!amount || amount < 50) {
              return NextResponse.json(
                { success: false, error: `Monthly amount for month ${i + 1} must be at least ₹50` },
                { status: 400 }
              );
            }
          }
        } else if (option.monthlyAmount) {
          // Old format: single monthly amount (backward compatibility)
          if (option.monthlyAmount < 50) {
            return NextResponse.json(
              { success: false, error: 'Monthly amount must be at least ₹50' },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Either monthlyAmounts array or monthlyAmount must be provided' },
            { status: 400 }
          );
        }

        // Validate processing fee
        if (option.processingFee < 0) {
          return NextResponse.json(
            { success: false, error: 'Processing fee cannot be negative' },
            { status: 400 }
          );
        }
      }
    }

    // Validate other fields
    if (emiPrice && emiPrice < 0) {
      return NextResponse.json(
        { success: false, error: 'EMI price cannot be negative' },
        { status: 400 }
      );
    }

    if (emiProcessingFeePercentage && (emiProcessingFeePercentage < 0 || emiProcessingFeePercentage > 50)) {
      return NextResponse.json(
        { success: false, error: 'Processing fee percentage must be between 0 and 50' },
        { status: 400 }
      );
    }

    if (emiMinimumAmount && emiMinimumAmount < 0) {
      return NextResponse.json(
        { success: false, error: 'Minimum amount cannot be negative' },
        { status: 400 }
      );
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