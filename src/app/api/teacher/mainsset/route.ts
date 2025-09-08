// app/api/teacher/mainsset/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import MainsSet from "@/models/mainsSetModel";

/**
 * GET: teacher view — list mains sets + their submissions (with user ids)
 * NOTE: no auth role-check is performed here; add auth if needed.
 */
export async function GET() {
  try {
    await connectMongo();
    const sets = await MainsSet.find()
      .populate({ path: "course", select: "title" })
      .populate({ path: "submissions.user", select: "name email" })
      .lean();

    // normalize shape for client
    const payload = sets.map((s: any) => ({
      _id: s._id.toString(),
      title: s.title,
      course: { title: s.course?.title || "" },
      submissions: (s.submissions || []).map((sub: any) => ({
        user: {
          _id: sub.user?._id?.toString() || sub.user?.toString?.() || "",
          name: sub.user?.name || sub.user?.email || sub.user?.toString?.(),
          email: sub.user?.email || "",
        },
        answers: (sub.answers || []).map((a: any) => ({
          questionId: a.questionId,
          answerFile: a.answerFile,
          marks: a.marks,
        })),
        status: sub.status,
        totalMarks: sub.totalMarks,
      })),
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/teacher/mainsset error:", err);
    return NextResponse.json({ error: "Failed to fetch sets" }, { status: 500 });
  }
}
