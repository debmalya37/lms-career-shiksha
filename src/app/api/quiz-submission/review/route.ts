// src/app/api/quiz-submission/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import QuizSubmission from "@/models/quizSubmissionModel";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { submissionId, answers, generalFeedback, teacherId } = await req.json();

    if (!submissionId || !answers) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const submission = await QuizSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    // Update answers
    let totalScore = 0;
    submission.answers.forEach((ans: { marksAwarded?: number; teacherFeedback?: string }, index: number) => {
      if (answers[index]) {
        ans.marksAwarded = answers[index].marksAwarded ?? ans.marksAwarded ?? 0;
        ans.teacherFeedback = answers[index].teacherFeedback ?? ans.teacherFeedback;
      }
      totalScore += ans.marksAwarded || 0;
    });

    // Update submission fields
    submission.finalScore = totalScore;
    submission.teacherGeneralFeedback = generalFeedback || submission.teacherGeneralFeedback;
    submission.reviewedBy = teacherId ? new mongoose.Types.ObjectId(teacherId) : undefined;
    submission.reviewedAt = new Date();

    // Determine status
    const pendingReviewExists = submission.answers.some(
      (a:any) => a.questionType === "descriptive" && (a.marksAwarded === undefined || a.marksAwarded === null)
    );
    submission.status = pendingReviewExists ? "partially_reviewed" : "reviewed";

    await submission.save();

    return NextResponse.json(
      { message: "Review saved successfully", finalScore: totalScore },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { message: "Error submitting review" },
      { status: 500 }
    );
  }
}
