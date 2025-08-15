// src/app/api/admin/emi-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const currentDate = new Date();
    const sevenDaysFromNow = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));

    // Get comprehensive EMI statistics
    const stats = await User.aggregate([
      {
        $match: {
          'purchaseHistory.isEMI': true
        }
      },
      {
        $unwind: '$purchaseHistory'
      },
      {
        $match: {
          'purchaseHistory.isEMI': true
        }
      },
      {
        $group: {
          _id: null,
          totalEMIUsers: { $addToSet: '$_id' },
          totalEMICourses: { $sum: 1 },
          totalOutstandingAmount: {
            $sum: {
              $multiply: ['$purchaseHistory.emiAmount', '$purchaseHistory.monthsLeft']
            }
          },
          overduePayments: {
            $sum: {
              $cond: [
                { $lt: ['$purchaseHistory.nextEMIDueDate', currentDate] },
                1,
                0
              ]
            }
          },
          upcomingPayments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$purchaseHistory.nextEMIDueDate', currentDate] },
                    { $lte: ['$purchaseHistory.nextEMIDueDate', sevenDaysFromNow] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          totalEMIUsers: { $size: '$totalEMIUsers' },
          totalEMICourses: 1,
          totalOutstandingAmount: { $round: ['$totalOutstandingAmount', 2] },
          overduePayments: 1,
          upcomingPayments: 1
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: stats[0] || {
        totalEMIUsers: 0,
        totalEMICourses: 0,
        totalOutstandingAmount: 0,
        overduePayments: 0,
        upcomingPayments: 0
      }
    });

  } catch (error) {
    console.error('Error fetching EMI stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch EMI statistics' },
      { status: 500 }
    );
  }
}