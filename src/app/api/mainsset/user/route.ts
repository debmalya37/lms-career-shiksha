// app/api/mainsset/user/route.ts
import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";
import MainsSet from "@/models/mainsSetModel";
import Course from "@/models/courseModel";

/**
 * GET: returns mains sets for courses the user has (and course.mainsAvailable === true)
 */
export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    const sessionToken = req.cookies.get("sessionToken")?.value;
    if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ sessionToken }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // fetch user's courses
    const userCourseIds = (user.course || []).map((c: any) => c.toString());
    if (userCourseIds.length === 0) return NextResponse.json([]);

    // fetch mains sets for those courses and ensure course.mainsAvailable is true
    const sets = await MainsSet.find({ course: { $in: userCourseIds } })
      .populate("course", "title mainsAvailable")
      .lean();

    // filter out sets whose course has mainsAvailable !== true
    const filtered = sets.filter((s: any) => s.course && s.course.mainsAvailable);

    // minimal shape for client
    const payload = filtered.map((s: any) => ({
      _id: s._id.toString(),
      title: s.title,
      description: s.description,
      course: { _id: s.course._id.toString(), title: s.course.title },
      questions: s.questions.map((q: any) => ({ questionText: q.questionText, maxMarks: q.maxMarks })),
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/mainsset/user error:", err);
    return NextResponse.json({ error: "Failed to fetch mains sets" }, { status: 500 });
  }
}
