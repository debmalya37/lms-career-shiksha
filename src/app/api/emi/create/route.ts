// /api/emi/create/route.ts - Create EMI record after successful first payment
import { NextRequest, NextResponse } from "next/server";
import EMI from "@/models/emiModel";
import Course from "@/models/courseModel";
import dbConnect from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { 
      userId, 
      courseId, 
      transactionId, 
      selectedMonths, 
      monthlyAmount,
      processingFee 
    } = await request.json();

    // Validate required fields
    if (!userId || !courseId || !transactionId || !selectedMonths || !monthlyAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get course data
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if EMI record already exists
    const existingEMI = await EMI.findOne({ 
      userId, 
      courseId, 
      originalTransactionId: transactionId 
    });

    if (existingEMI) {
      return NextResponse.json(
        { success: false, error: 'EMI record already exists' },
        { status: 400 }
      );
    }

    // Calculate next due date (1 month from now)
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    // Create EMI record
    const emiRecord = new EMI({
      userId,
      courseId,
      originalTransactionId: transactionId,
      totalAmount: course.emiPrice,
      emiAmount: monthlyAmount,
      totalEMIMonths: selectedMonths,
      monthsLeft: selectedMonths - 1, // First payment already made
      nextEMIDueDate: nextDueDate,
      processingFee: processingFee || 0,
      payments: [{
        paymentDate: new Date(),
        amount: monthlyAmount + (processingFee || 0),
        transactionId: transactionId,
        status: 'success'
      }]
    });

    await emiRecord.save();

    return NextResponse.json({
      success: true,
      data: emiRecord
    });
  } catch (error) {
    console.error('Error creating EMI record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create EMI record' },
      { status: 500 }
    );
  }
}