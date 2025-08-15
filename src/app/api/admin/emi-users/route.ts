// src/app/api/admin/emi-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user'; // Adjust path as needed
import dbConnect from '@/lib/db';

// Connect to MongoDB (you might have this in a separate file)


export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all users with EMI purchases
    const emiUsers = await User.find({
      'purchaseHistory.isEMI': true
    })
    .populate('purchaseHistory.course', 'title')
    .select('name email phoneNo purchaseHistory')
    .lean();

    // Filter to only include EMI purchases in the response
    const filteredUsers = emiUsers.map(user => ({
      ...user,
      purchaseHistory: user.purchaseHistory.filter((purchase: any) => purchase.isEMI)
    }));

    return NextResponse.json({
      success: true,
      data: filteredUsers
    });

  } catch (error) {
    console.error('Error fetching EMI users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch EMI users' },
      { status: 500 }
    );
  }
}