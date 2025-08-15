// src/app/api/admin/users/[userId]/remove-course/[courseId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';



interface Params {
  userId: string;
  courseId: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await dbConnect();

    const { userId, courseId } = params;

    // Remove course from user's course array
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          course: new mongoose.Types.ObjectId(courseId)
        }
      }
    );

    // Also remove from purchase history if needed
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          'purchaseHistory': {
            'course': new mongoose.Types.ObjectId(courseId)
          }
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Course removed successfully'
    });

  } catch (error) {
    console.error('Error removing course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove course' },
      { status: 500 }
    );
  }
}
