// /api/test-series/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import TestSeries from '@/models/testSeriesModel';
import { User } from '@/models/user';
import Profile from '@/models/profileModel';
import Course, { ICourse } from '@/models/courseModel';
import Subject, { ISubject } from '@/models/subjectModel';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken')?.value; // Get session token from cookies

  try {
    await connectMongo();

    // Step 1: Fetch user details
    const user = await User.findOne({ sessionToken });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userCourse = user.course; // Assuming this is a single course ID

    // Step 2: Define the query and fetch test series by user's course
    const query: any = {};
    if (userCourse) query.course = userCourse;

    const testSeriesList = await TestSeries.find(query).lean();

    // Step 3: Extract unique course and subject IDs from test series
    const courseIds = Array.from(new Set(testSeriesList.map((test: any) => test.course as Types.ObjectId)));
    const subjectIds = Array.from(new Set(testSeriesList.map((test: any) => test.subject as Types.ObjectId)));

    // Step 4: Fetch all courses and subjects independently
    const [courses, subjects] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }).lean<ICourse[]>(),
      Subject.find({ _id: { $in: subjectIds } }).lean<ISubject[]>()
    ]);

    // Step 5: Map courses and subjects by their IDs for quick lookup
    const courseMap: Record<string, ICourse> = courses.reduce((acc, course) => {
      acc[(course._id as Types.ObjectId).toString()] = course;
      return acc;
    }, {} as Record<string, ICourse>);

    const subjectMap: Record<string, ISubject> = subjects.reduce((acc, subject) => {
      acc[(subject._id as Types.ObjectId).toString()] = subject;
      return acc;
    }, {} as Record<string, ISubject>);

    // Step 6: Enrich test series with course and subject details
    const enrichedTestSeries = testSeriesList.map((test: any) => ({
      ...test,
      course: courseMap[(test.course as Types.ObjectId).toString()]?.title || 'Unknown Course',
      subject: subjectMap[(test.subject as Types.ObjectId).toString()]?.name || 'Unknown Subject'
    }));

    return NextResponse.json(enrichedTestSeries);
  } catch (error) {
    console.error("GET /api/test-series Error:", error);
    return NextResponse.json({ error: 'Failed to fetch test series' }, { status: 500 });
  }
}



export async function POST(request: Request) {
  const { title, googleFormLink, course, subject } = await request.json();

  try {
    await connectMongo();
    const newTestSeries = new TestSeries({ 
      title, 
      googleFormLink, 
      course, 
      subject 
    });
    await newTestSeries.save();

    return NextResponse.json({ message: 'Test series added successfully!' });
  } catch (error) {
    console.error("POST /api/test-series Error:", error);
    return NextResponse.json({ error: 'Failed to add test series' }, { status: 500 });
  }
}