// app/api/profile/route.ts

import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';
import Profile from '@/models/profileModel';
import Course from '@/models/courseModel';
import Subject from '@/models/subjectModel';
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
    const rawCourses = await Course.find({ _id: { $in: user.course } })
      .lean<RawCourse[]>();   // ← note the array type here

    // 3) Fetch all subjects referenced by those courses
    const allSubjectIds: Types.ObjectId[] = rawCourses.flatMap((c: RawCourse) => c.subjects);
    const rawSubjects = await Subject.find({ _id: { $in: allSubjectIds } })
      .lean<RawSubject[]>();  // ← array type

    // 4) Build lookup to turn ObjectId → RawSubject
    const subjectMap: Record<string, RawSubject> = rawSubjects.reduce(
      (acc: Record<string, RawSubject>, s: RawSubject) => {
        acc[s._id.toString()] = s;
        return acc;
      },
      {}
    );

    // 5) Build map of when each course was purchased
    const purchaseMap: Record<string, Date> = (user.purchaseHistory || []).reduce(
      (acc: Record<string, Date>, rec) => {
        acc[rec.course.toString()] = rec.purchasedAt;
        return acc;
      },
      {}
    );

    const now = new Date();

    // 6) Enrich + filter out expired
    const activeCourses = rawCourses
  .map((course: RawCourse) => {
    const courseIdStr = course._id.toString();
    const purchasedAt = purchaseMap[courseIdStr];

    // If user has purchased this course, check expiry
    if (purchasedAt) {
      const expiry = new Date(purchasedAt);
      expiry.setDate(expiry.getDate() + course.duration);
      if (expiry <= now) return null; // expired → skip
    }

    // Either not purchased (so show it anyway) or still valid
    return {
      _id:             courseIdStr,
      title:           course.title,
      description:     course.description,
      courseImg:       course.courseImg,
      createdAt:       course.createdAt.toISOString(),
      isHidden:        course.isHidden,
      price:           course.price,
      isFree:          course.isFree,
      discountedPrice: course.discountedPrice,
      duration:        course.duration,
      introVideo:      course.introVideo,
      subjects: course.subjects
        .map((id: Types.ObjectId) => subjectMap[id.toString()])
        .filter((s): s is RawSubject => !!s)
        .map((s: RawSubject) => ({ _id: s._id.toString(), name: s.name })),
    };
  })
  .filter((c): c is NonNullable<typeof c> => c !== null);


    // 7) Fetch profile doc
    const profile = await Profile.findOne({ userId: user._id }).lean();

    // 8) Respond
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
      console.log("posting profile : ",profile);
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    return NextResponse.json({ message: 'Profile saved successfully!', profile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
