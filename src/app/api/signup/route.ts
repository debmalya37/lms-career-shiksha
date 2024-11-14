import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/user';

export async function POST(request: Request) {
    await dbConnect();
  
    const { email, password } = await request.json();
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }
  
      const newUser = new User({
        name: email.split('@')[0], // Default to using the email username as the name
        email,
        password,
        subscription: 0, // Default to no subscription
        course: [], // No courses initially
        sessionToken: null, // Explicitly set or omit this if it's not needed at signup
      });
  
      await newUser.save();
  
      return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
    } catch (error) {
      console.error('Error during signup:', error);
      return NextResponse.json({ error: 'Error during signup' }, { status: 500 });
    }
  }
  