// app/api/forgot-password/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const { email } = await request.json();
  await connectMongo();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Email not registered" }, { status: 404 });
  }

  // generate 6‑digit OTP + expiry in 10m
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.resetOTP = otp;
  user.resetOTPExpires = otpExpires;
  await user.save();

  // send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your password reset code",
    text: `Your code is ${otp}. It expires in 10 minutes.`,
  });

  return NextResponse.json({ success: true });
}
