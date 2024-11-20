import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; // Database connection utility
import { User } from '@/models/user'; // User model

export async function POST(request: Request) {
  await dbConnect(); // Connect to the database

  const { id, name, email, password, subscription, phoneNo, address, course } = await request.json();

  try {
    // Find user by ID and update with new data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password, subscription, phoneNo, address, course },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}
