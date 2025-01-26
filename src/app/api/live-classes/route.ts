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

    let query = {};

    if (courseIds && courseIds.length > 0) {
      // Validate courseIds
      const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
      if (!courseIds.every(isValidObjectId)) {
        return NextResponse.json(
          { error: "One or more courseIds are invalid" },
          { status: 400 }
        );
      }

      // If courseIds are provided, filter by them
      query = { course: { $in: courseIds } };
    }

    // Fetch live classes based on the query
    const liveClasses = await LiveClass.find(query)
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



// DELETE method to delete a live class by ID
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const liveClassId = searchParams.get("id"); // Get live class ID from query parameters

  try {
    await connectMongo();

    // Validate the provided ID
    if (!liveClassId || !/^[0-9a-fA-F]{24}$/.test(liveClassId)) {
      return NextResponse.json(
        { error: "Invalid or missing live class ID" },
        { status: 400 }
      );
    }

    // Delete the live class
    const result = await LiveClass.findByIdAndDelete(liveClassId);

    if (!result) {
      return NextResponse.json(
        { error: "Live class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Live class deleted successfully!" });
  } catch (error) {
    console.error("Error deleting live class:", error);
    return NextResponse.json(
      { error: "Failed to delete live class" },
      { status: 500 }
    );
  }
}