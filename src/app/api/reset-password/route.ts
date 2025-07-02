// app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";

export async function POST(request: Request) {
  const { email, newPassword } = await request.json();
  await connectMongo();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Here you should hash the password in production
  user.password = newPassword;
  await user.save();
  return NextResponse.json({ success: true });
}
