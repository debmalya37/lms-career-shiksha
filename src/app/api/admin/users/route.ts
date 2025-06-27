export const dynamic = 'force-dynamic';
// File: app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import { User,  PurchaseRecord } from '@/models/user';
import dbConnect from '@/lib/db';
type Stats = {
  totalUsers:          number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  usersByCourse:       Record<string, number>;
  revenueByUser:       { userId: string; name: string; revenue: number }[];
};

export async function GET() {
    await dbConnect();
  
    try {
      // 1) load users + populate courses
      const users = await User.find().populate('course').lean();
      // transform for frontend
      const transformedUsers = users.map(u => ({
        _id:             u._id,
        name:            u.name,
        email:           u.email,
        subscription:    u.subscription,
        course:          Array.isArray(u.course) ? u.course.map((c: any) => c.title) : [],
        address:         u.address,
        phoneNo:         u.phoneNo,
        deviceIdentifier:u.deviceIdentifier,
        createdAt:       u.createdAt,
        purchaseHistory: u.purchaseHistory ?? []
      }));
  
      // 2) total users
      const totalUsers = users.length;
  
      // 3) active vs expired subscriptions
      const now = Date.now();
      let active = 0, expired = 0;
      users.forEach(u => {
        if (!u.subscription) {
          expired++;
        } else {
          const expiry = new Date(u.createdAt).getTime() + u.subscription * 86400_000;
          if (expiry > now) active++;
          else expired++;
        }
      });
  
      // 4) revenue per user
      // inside GET, step 4) revenue per user
const revenueByUser = users.map(u => {
    const history = Array.isArray(u.purchaseHistory) ? u.purchaseHistory : [];
    // sum up paise → then convert to rupees
    const totalPaise = (history as PurchaseRecord[]).reduce((sum, p) => sum + p.amount, 0);
    const revenueRupees = totalPaise / 100;
    return {
      userId:  u._id.toString(),
      name:    u.name,
      revenue: revenueRupees,
    };
  });
  
  
      // 5) aggregate users-by-course via Mongo
      const agg = await User.aggregate([
        { $unwind: '$course' },
        { $group: { _id: '$course', count: { $sum: 1 } } },
        {
          $lookup: {
            from:         'courses',
            localField:   '_id',
            foreignField: '_id',
            as:           'course'
          }
        },
        { $unwind: '$course' },
        { $project: { _id: 0, title: '$course.title', count: 1 } }
      ]);
  
      const usersByCourse: Record<string, number> = {};
      agg.forEach(({ title, count }) => {
        usersByCourse[title] = count;
      });
  
      const stats: Stats = {
        totalUsers,
        activeSubscriptions:   active,
        expiredSubscriptions:  expired,
        usersByCourse,
        revenueByUser
      };
  
      return NextResponse.json({ stats, users: transformedUsers });
    } catch (err) {
      console.error('Error in GET /api/usercreation:', err);
      return NextResponse.json({ message: 'Error retrieving users' }, { status: 500 });
    }
  }