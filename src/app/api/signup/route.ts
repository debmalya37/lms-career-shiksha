import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();
  const { email, password, phoneNo, address } = await request.json(); // Accept phoneNo and address

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const newUser = new User({
      name: email.split('@')[0],
      email,
      password,
      phoneNo, // Add phoneNo
      address, // Add address
      subscription: 0,
      course: [],
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
