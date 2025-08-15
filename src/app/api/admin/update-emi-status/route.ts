// src/app/api/admin/update-emi-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';



export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { userId, courseId, paymentReceived } = await request.json();

    if (paymentReceived) {
      // Update EMI details when payment is received
      const result = await User.updateOne(
        {
          _id: userId,
          'purchaseHistory.course': new mongoose.Types.ObjectId(courseId),
          'purchaseHistory.isEMI': true
        },
        {
          $inc: {
            'purchaseHistory.$.monthsLeft': -1
          },
          $set: {
            'purchaseHistory.$.nextEMIDueDate': new Date(
              new Date().getTime() + (30 * 24 * 60 * 60 * 1000) // Add 30 days
            )
          }
        }
      );

      // If months left becomes 0, mark as complete
      await User.updateOne(
        {
          _id: userId,
          'purchaseHistory.course': new mongoose.Types.ObjectId(courseId),
          'purchaseHistory.monthsLeft': 0
        },
        {
          $set: {
            'purchaseHistory.$.isEMI': false,
            'purchaseHistory.$.nextEMIDueDate': null
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'EMI status updated successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating EMI status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update EMI status' },
      { status: 500 }
    );
  }
}