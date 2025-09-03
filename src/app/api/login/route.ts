// app/api/login/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";

export async function POST(request: Request) {
  const { email, password, deviceIdentifier } = await request.json();

  try {
    await connectMongo();

    // 1) Find user by email
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 2) Prevent simultaneous login on two devices
    if (user.deviceIdentifier && user.deviceIdentifier !== deviceIdentifier) {
      return NextResponse.json(
        { error: "This account is already logged in on another device" },
        { status: 403 }
      );
    }

    // 3) If no deviceIdentifier is set yet, record it
    if (!user.deviceIdentifier) {
      user.deviceIdentifier = deviceIdentifier;
    }

    // 4) Generate a new sessionToken
    const sessionToken = generateSessionToken();
    user.sessionToken = sessionToken;

    // 5) Compute cookie expiration based on subscription days (if any)
    const expirationDate = new Date();
    expirationDate.setDate(
      expirationDate.getDate() + (user?.subscription  || 120) // ?? 120 days by default
    );

    await user.save();

    // 6) Build the JSON response
    const response = NextResponse.json(
      {
        message: "Login successful",
        sessionToken,
        user: {
          email: user.email,
          name: user.name,
          course: user.course,
          subscription: user?.subscription || 120,
        },
      },
      { status: 200 }
    );

    // 7) Set the `sessionToken` cookie with SameSite=None and Secure
    response.cookies.set("sessionToken", sessionToken, {
      httpOnly: true,
      path: "/",
      // secure: process.env.NODE_ENV === "production",
      secure: false,
      sameSite: "lax", 
      expires: expirationDate,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}

/** Simple (non‐cryptographic) session‐token generator */
function generateSessionToken() {
  return Math.random().toString(36).substr(2);
}
