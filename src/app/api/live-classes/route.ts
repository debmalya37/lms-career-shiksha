import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import LiveClass from "@/models/liveClassesModel";

export async function POST(request: Request) {
  const { title, url, courses } = await request.json();

  try {
    await connectMongo();

    // Create a live class for each selected course
    const liveClasses = courses.map((courseId: string) => ({
      title,
      url,
      course: courseId,
    }));

    await LiveClass.insertMany(liveClasses);

    return NextResponse.json({ message: "Live classes added successfully!" });
  } catch (error) {
    console.error("Error adding live classes:", error);
    return NextResponse.json({ error: "Failed to add live classes" }, { status: 500 });
  }
}


// GET method for fetching live classes from the last 24 hours
// GET method for fetching live classes with course information

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseIds = searchParams.get("courseIds")?.split(","); // Get courseIds as a comma-separated list

  try {
    await connectMongo();

    // Validate courseIds
    if (!courseIds || courseIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing courseIds" },
        { status: 400 }
      );
    }

    // Check that all provided IDs are valid MongoDB ObjectId strings
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    if (!courseIds.every(isValidObjectId)) {
      return NextResponse.json(
        { error: "One or more courseIds are invalid" },
        { status: 400 }
      );
    }

    // Define the cutoff time for 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch live classes under the given courseIds and created within the last 24 hours
    const liveClasses = await LiveClass.find({
      course: { $in: courseIds }, // Filter by course IDs
      createdAt: { $gte: twentyFourHoursAgo }, // Filter for classes less than 24 hours old
    })
      .sort({ createdAt: -1 }) // Sort by the latest ones
      .populate("course", "title") // Populate course title
      .lean();

    return NextResponse.json(liveClasses);
  } catch (error) {
    console.error("Error fetching live classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch live classes" },
      { status: 500 }
    );
  }
}

