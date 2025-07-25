export const dynamic = 'force-dynamic';
// File: app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, PurchaseRecord } from '@/models/user';
import Course from '@/models/courseModel';

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
    // 1) Load users + populate their course docs (title + duration)
    const users = await User.find()
      .populate<{ course: Array<{ _id: any; title: string; duration: number }> }>(
        'course',
        'title duration'
      )
      .lean();

    const nowMs = Date.now();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    // 2) Transform users with safe guards
    const transformedUsers = users.map(u => {
      const courses = Array.isArray(u.course) ? u.course : [];

      // build array of per-course progress
      const courseProgress = courses.map(c => {
        // only treat purchaseHistory as an array if it really is
        const history = Array.isArray(u.purchaseHistory)
          ? (u.purchaseHistory as PurchaseRecord[])
          : [];

        const rec = history.find(
          p => p.course.toString() === c._id.toString()
        );

        let daysLeft: number | null = null;
        if (rec) {
          const purchaseMs = new Date(rec.purchasedAt).getTime();
          const expiryMs = purchaseMs + c.duration * MS_PER_DAY;
          daysLeft = Math.max(0, Math.ceil((expiryMs - nowMs) / MS_PER_DAY));
        }

        return {
          courseId:    c._id.toString(),
          title:       c.title,
          duration:    c.duration,
          purchasedAt: rec?.purchasedAt.toISOString() || null,
          daysLeft,
        };
      });

      return {
        _id:             u._id.toString(),
        name:            u.name,
        email:           u.email,
        phoneNo:         u.phoneNo,
        subscription:    u.subscription,
        createdAt:       u.createdAt,
        purchaseHistory: Array.isArray(u.purchaseHistory) ? u.purchaseHistory : [],
        courseProgress,
      };
    });

    // 3) Stats: total users
    const totalUsers = users.length;

    // 4) Stats: active vs expired subscriptions
    let active = 0, expired = 0;
    users.forEach(u => {
      if (!u.subscription) {
        expired++;
      } else {
        const createdMs = new Date(u.createdAt).getTime();
        const expiryMs  = createdMs + u.subscription * MS_PER_DAY;
        expiryMs > nowMs ? active++ : expired++;
      }
    });

    // 5) Stats: revenue per user
    const revenueByUser = users.map(u => {
      const history = Array.isArray(u.purchaseHistory)
        ? (u.purchaseHistory as PurchaseRecord[])
        : [];
      const totalPaise = history.reduce((s, p) => s + p.amount, 0);
      return {
        userId:  u._id.toString(),
        name:    u.name,
        revenue: totalPaise / 100,
      };
    });

    // 6) Stats: users by course
    const agg = await User.aggregate([
      { $unwind: '$course' },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      { $project: { _id: 0, title: '$course.title', count: 1 } }
    ]);
    const usersByCourse: Record<string, number> = {};
    agg.forEach(({ title, count }: any) => {
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
    console.error('Error in GET /api/admin/users:', err);
    return NextResponse.json({ message: 'Error retrieving users' }, { status: 500 });
  }
}
