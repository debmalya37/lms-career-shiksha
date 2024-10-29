import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';
import Subject from '@/models/subjectModel';
import mongoose from 'mongoose';


export async function POST(request: Request) {
  try {
    const { title, description, url, subject, topic } = await request.json();

    // Ensure required fields are provided
    if (!title || !description || !url || !subject || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectMongo(); // Connect to MongoDB

    const newCourse = new Course({ title, description, url, subject, topic });
    await newCourse.save();

    return NextResponse.json({ message: 'Course added successfully!' });
  } catch (error) {
    console.error("POST /api/course Error:", error);
    return NextResponse.json({ error: 'Failed to add course' }, { status: 500 });
  }
}

// GET method to fetch all courses or filter by subject/topic

export async function GET(request: Request) {
  try {
    await connectMongo();

    // Fetch courses without populating `subject` and `topic` references
    const courses = await Course.find({});

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/course Error:", error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}



