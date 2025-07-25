// app/api/profile/route.ts

import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';
import Profile from '@/models/profileModel';
import Course from '@/models/courseModel';
import Subject from '@/models/subjectModel';
import Tutorial from '@/models/tutorialModel';
import Progress from '@/models/progressModel';
import { Types } from 'mongoose';

/** The shape of one Course document from `.lean()` */
type RawCourse = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  subjects: Types.ObjectId[];
  courseImg?: string;
  createdAt: Date;
  isHidden: boolean;
  price: number;
  isFree: boolean;
  discountedPrice: number;
  duration: number;       // in days
  introVideo: string;
};

/** The shape of one Subject document from `.lean()` */
type RawSubject = {
  _id: Types.ObjectId;
  name: string;
};

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken')?.value;

  try {
    await connectMongo();
    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token is missing' }, { status: 401 });
    }

    // 1) Load user
    const user = await User.findOne({ sessionToken }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2) Fetch all courses the user ever purchased
    const rawCourses = await Course.find({ _id: { $in: user.course } }).lean<RawCourse[]>();

    // 3) Fetch all subjects referenced by those courses
    const allSubjectIds: Types.ObjectId[] = rawCourses.flatMap(c => c.subjects);
    const rawSubjects = await Subject.find({ _id: { $in: allSubjectIds } }).lean<RawSubject[]>();

    // 4) Build lookup to turn ObjectId → RawSubject
    const subjectMap: Record<string, RawSubject> = rawSubjects.reduce((acc, s) => {
      acc[s._id.toString()] = s;
      return acc;
    }, {} as Record<string, RawSubject>);

    // 5) Build map of when each course was purchased
    const purchaseMap: Record<string, Date> = (user.purchaseHistory || []).reduce((acc, rec) => {
      acc[rec.course.toString()] = rec.purchasedAt;
      return acc;
    }, {} as Record<string, Date>);

    const now = new Date();
// helper to compute days difference, rounding up
   const msPerDay = 24*60*60*1000;
    // 6) Filter out expired
    const validRawCourses = rawCourses.filter(course => {
      const purchasedAt = purchaseMap[course._id.toString()];
      if (purchasedAt) {
        const expiry = new Date(purchasedAt);
        expiry.setDate(expiry.getDate() + course.duration);
        return expiry > now;
      }
      return true;
    });

    const courseIds = validRawCourses.map(c => c._id);

    // 7) Fetch completed tutorial progress for these courses
    const completedDocs = await Progress.find({
      user: user._id,
      course: { $in: courseIds },
      completed: true
    }).lean();

    const completedMap = completedDocs.reduce((acc, p) => {
      const cid = (p.course as Types.ObjectId).toString();
      acc[cid] = (acc[cid] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 8) Compute total tutorials per course
    const tutorialCounts: Record<string, number> = {};
    for (const course of validRawCourses) {
      const total = await Tutorial.countDocuments({ subject: { $in: course.subjects } });
      tutorialCounts[course._id.toString()] = total;
    }

    // 9) Enrich courses with subjects & progress
    const activeCourses = validRawCourses.map(course => {
      const idStr = course._id.toString();
      // find when this course was purchased
      const purchasedAt = purchaseMap[idStr];
     // compute expiry date = purchase + duration days
      const expiryDate = purchasedAt
        ? new Date(purchasedAt.getTime() + course.duration * msPerDay)
        : null;
     // days left (if expiryDate in future)
      const daysLeft = expiryDate
        ? Math.max(
            0,
            Math.ceil((expiryDate.getTime() - now.getTime()) / msPerDay)
          )
        : null;
      const total = tutorialCounts[idStr] || 0;
      const completed = completedMap[idStr] || 0;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        _id:             idStr,
        title:           course.title,
        description:     course.description,
        courseImg:       course.courseImg,
        createdAt:       course.createdAt.toISOString(),
        isHidden:        course.isHidden,
        price:           course.price,
        isFree:          course.isFree,
        discountedPrice: course.discountedPrice,
        duration:        course.duration,
        purchasedAt:     purchasedAt?.toISOString()  || null,
        expiryDate:      expiryDate?.toISOString()   || null,
        daysLeft,                                   // integer or null
        introVideo:      course.introVideo,
        subjects: course.subjects
          .map(id => subjectMap[id.toString()])
          .filter((s): s is RawSubject => !!s)
          .map(s => ({ _id: s._id.toString(), name: s.name })),
        progress: {
          total,
          completed,
          percent
        }
      };
    });

    // 10) Fetch profile doc
    const profile = await Profile.findOne({ userId: user._id }).lean();

    // 11) Respond
    return NextResponse.json({
      userId:       user._id.toString(),
      email:        user.email,
      name:         user.name,
      courses:      activeCourses,
      subscription: user.subscription,
      phoneNo:      user.phoneNo,
      address:      user.address,
      profile,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId, firstName, lastName, email, subject, aim } = await request.json();

  try {
    await connectMongo();

    // Find existing profile or create a new one
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { firstName, lastName, email, subject, aim },
      { new: true, upsert: true }
    );
    console.log("posting profile : ", profile);
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    return NextResponse.json({ message: 'Profile saved successfully!', profile });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
