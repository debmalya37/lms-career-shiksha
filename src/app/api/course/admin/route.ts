import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';
import Subject, { ISubject } from '@/models/subjectModel';
import { Types } from 'mongoose';


export async function GET() {
    try {
      await connectMongo();
  
      // Step 1: Fetch courses without populating subjects
      const courses = await Course.find({}).lean();
  
      // Step 2: Extract unique subject IDs from courses
      const subjectIds: Types.ObjectId[] = courses.flatMap(course => course.subjects as Types.ObjectId[]);
  
      // Step 3: Fetch all subjects by IDs
      const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean<ISubject[]>(); // Cast as ISubject[]
  
      // Step 4: Map subjects by their ID for quick lookup
      const subjectMap: Record<string, ISubject> = subjects.reduce((acc, subject) => {
        acc[(subject._id as Types.ObjectId).toString()] = subject; // Convert _id to string to avoid type issues
        return acc;
      }, {} as Record<string, ISubject>);
  
      // Step 5: Merge subjects with each course
      const enrichedCourses = courses.map(course => ({
        ...course,
        subjects: (course.subjects as Types.ObjectId[]).map(subjectId => subjectMap[subjectId.toString()] || null).filter(Boolean),
      }));
  
      return NextResponse.json(enrichedCourses);
    } catch (error) {
      console.error("GET /api/course Error:", error);
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
  }