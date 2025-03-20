import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";

// Helper function to find a user by session token.
async function getUserByToken(token: string) {
  return await User.findOne({ sessionToken: token });
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body.
    const { confirm } = await request.json();
    if (!confirm) {
      return NextResponse.json(
        { error: "Account deletion not confirmed." },
        { status: 400 }
      );
    }

    // Extract the session token from cookies.
    const sessionToken = request.cookies.get("sessionToken")?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized: No session token provided." },
        { status: 401 }
      );
    }

    // Connect to your MongoDB database.
    await dbConnect();

    // Retrieve the user using the session token.
    const user = await getUserByToken(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Delete the user account from the database.
    await User.findByIdAndDelete(user._id);

    // Optionally, delete or archive any associated data here.

    return NextResponse.json(
      { message: "Account deletion successful." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
