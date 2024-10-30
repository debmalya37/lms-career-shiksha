import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; // Import your database connection utility
import { User } from '@/models/user'; // Import your user model

export async function POST(request: Request) {
  await dbConnect(); // Ensure you are connected to the database

  const { name, email, password, subscriptionDays, course } = await request.json();

  try {
    const newUser = new User({
      name,
      email,
      password, // Make sure to hash the password before saving it
      subscription: subscriptionDays,
      course, // course should be an ObjectId
    });

    await newUser.save();
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}


export async function GET() {
    await dbConnect(); // Ensure you are connected to the database
  
    try {
      const users = await User.find().populate('course'); // Populate the course field
  
      // Transform the users data to include the course name
      const transformedUsers = users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password, // Avoid sending the password in production
        subscription: user.subscription, // Ensure this is a number
        course: user.course ? user.course.title : null, // Get the course name
      }));
  
      return NextResponse.json(transformedUsers);
    } catch (error) {
      console.error('Error retrieving users:', error);
      return NextResponse.json({ message: 'Error retrieving users' }, { status: 500 });
    }
  }
  