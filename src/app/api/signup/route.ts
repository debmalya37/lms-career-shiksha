import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import Course, { ICourse } from "@/models/courseModel"; // Import the Course model
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();
  const { email, password, phoneNo, address } = await request.json(); // Accept phoneNo and address

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Fetch the demo course ID
    const demoCourse = await Course.findOne({ title: "Free Demo Course" }).lean<ICourse>();

    if (!demoCourse) {
      return NextResponse.json({ error: 'Demo course not found' }, { status: 404 });
    }

    // Create the new user and assign the demo course
    const newUser = new User({
      name: email.split('@')[0],
      email,
      password,
      phoneNo, // Add phoneNo
      address, // Add address
      subscription: 30, // Default subscription duration
      course: [demoCourse._id], // Assign the demo course ID
      sessionToken: null,
      deviceIdentifier: null,
    });

    await newUser.save();
    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'Error during signup' }, { status: 500 });
  }
}
