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
    return NextResponse.json(
      { error: "Email not registered" },
      { status: 404 }
    );
  }

  // generate 6‑digit OTP + expiry in 10m
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.resetOTP = otp;
  user.resetOTPExpires = otpExpires;
  await user.save();

  // build HTML email
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password - SEO Earning Space</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; }
    .container { background-color: #fff; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo img { height: 50px; }
    .title { font-size: 20px; font-weight: bold; color: #333; text-align: center; margin-bottom: 10px; }
    .message { font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 20px; }
    .otp-box { font-size: 28px; font-weight: bold; text-align: center; background-color: #f1f3f6; padding: 15px; border-radius: 8px; color: #2a7de1; letter-spacing: 4px; margin-bottom: 25px; }
    .support { font-size: 14px; text-align: center; margin-top: 10px; color: #555; }
    .footer { font-size: 14px; color: #888; text-align: center; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://seoearningspace.com/logo.png" alt="SEO Earning Space Logo" />
    </div>
    <div class="title">Password Reset Request</div>
    <div class="message">
      Hi <strong>${user.name || email}</strong>,<br><br>
      We received a request to reset the password for your <strong>SEO Earning Space</strong> account.<br>
      Use the code below to proceed. This code is valid for the next <strong>10 minutes</strong>.
    </div>
    <div class="otp-box">${otp}</div>
    <div class="message">
      If you did not request this, you can safely ignore this email. Your account remains secure.
    </div>
    <div class="support">
      Need help? Contact us at <a href="mailto:support@seoearningspace.com">support@seoearningspace.com</a>
    </div>
    <div class="footer">
      SEO Earning Space<br>
      <em>Empowering your micro‑task earnings</em>
    </div>
  </div>
</body>
</html>`;

  // send HTML email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  await transporter.sendMail({
    from: `"SEO Earnings" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Password Reset Code",
    html,
  });

  return NextResponse.json({ success: true });
}
