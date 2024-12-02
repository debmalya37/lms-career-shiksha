import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';
import Profile from '@/models/profileModel';
import Course, { ICourse } from '@/models/courseModel';
import Subject, { ISubject } from '@/models/subjectModel';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken')?.value;

  try {
    await connectMongo();

    // Find the user by session token
    const user = await User.findOne({ sessionToken }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 1: Fetch user courses
    const courses = await Course.find({ _id: { $in: user.course } }).lean();

    // Step 2: Extract unique subject IDs from courses
    const subjectIds: Types.ObjectId[] = courses.flatMap(
      (course) => course.subjects as Types.ObjectId[]
    );

    // Step 3: Fetch all subjects by IDs
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean<ISubject[]>();

    // Step 4: Map subjects by their ID for quick lookup
    const subjectMap: Record<string, ISubject> = subjects.reduce((acc, subject) => {
      acc[(subject._id as Types.ObjectId).toString()] = subject;
      return acc;
    }, {} as Record<string, ISubject>);

    // Step 5: Enrich courses with subject details
    const enrichedCourses = courses.map((course) => ({
      ...course,
      subjects: (course.subjects as Types.ObjectId[])
        .map((subjectId) => subjectMap[subjectId.toString()] || null)
        .filter(Boolean) // Filter out null values
        .map((subject) => ({
          _id: String(subject._id),
          name: subject.name,
        })),
    }));

    // Fetch profile information
    const profile = await Profile.findOne({ userId: user._id }).lean();

    // Construct the response
    return NextResponse.json({
      email: user.email,
      name: user.name,
      courses: enrichedCourses, // Enriched course details
      subscription: user.subscription,
      phoneNo: user.phoneNo,
      address: user.address,
      profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
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
