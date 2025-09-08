import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MainsSet from "@/models/mainsSetModel";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { userId, marks } = await req.json();

  const mainsSet = await MainsSet.findById(params.id);
  if (!mainsSet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const submission = mainsSet.submissions.find(
    (s:any) => s.user.toString() === userId
  );
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  submission.answers.forEach((ans:any) => {
    if (marks[ans.questionId] !== undefined) {
      ans.marks = marks[ans.questionId];
    }
  });

  submission.totalMarks = submission.answers.reduce(
    (sum:any, a:any) => sum + (a.marks || 0),
    0
  );
  submission.status = "reviewed";
  submission.reviewedAt = new Date();

  await mainsSet.save();

  return NextResponse.json({ success: true, totalMarks: submission.totalMarks });
}
