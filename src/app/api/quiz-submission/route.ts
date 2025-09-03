// src/app/api/quiz-submission/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import QuizSubmission from "@/models/quizSubmissionModel";
import QuizScore from "@/models/quizScoreModel";

type IncomingAnswer = {
  questionId: string;
  questionType?: string;
  selectedAnswer?: string | string[] | null;
  descriptiveAnswer?: string | null;
  marks?: number;
  isCorrect?: boolean | null;
  marksAwarded?: number | null;
  teacherFeedback?: string | null;
  needsReview?: boolean;
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const quizTitle = searchParams.get("quizTitle");
    const userName = searchParams.get("userName");

    const query: any = {};

    if (status && status !== "all") query.status = status;
    if (quizTitle) query.quizTitle = { $regex: quizTitle, $options: "i" };
    if (userName) query.userName = { $regex: userName, $options: "i" };

    const submissions = await QuizSubmission.find(query)
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("Error fetching quiz submissions:", error);
    return NextResponse.json(
      { message: "Error fetching quiz submissions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    // Basic validation
    const {
      quizId,
      userId,
      userName,
      userEmail,
      courseId,
      subjectId,
      quizTitle,
      answers: incomingAnswers,
      totalScore: providedTotalScore,
      maxScore: providedMaxScore,
      correctAnswers: providedCorrect,
      incorrectAnswers: providedIncorrect,
      skippedQuestions: providedSkipped,
    } = body || {};

    if (!quizId || !userId || !userName || !userEmail || !Array.isArray(incomingAnswers)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // validate object id formats
    if (!mongoose.isValidObjectId(quizId) || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ message: "Invalid quizId or userId" }, { status: 400 });
    }
    if (courseId && !mongoose.isValidObjectId(courseId)) {
      return NextResponse.json({ message: "Invalid courseId" }, { status: 400 });
    }
    if (subjectId && !mongoose.isValidObjectId(subjectId)) {
      return NextResponse.json({ message: "Invalid subjectId" }, { status: 400 });
    }

    // Normalize answers
    const answers: IncomingAnswer[] = incomingAnswers.map((a: any) => ({
      questionId: a.questionId,
      questionType: a.questionType || "mcq",
      selectedAnswer: a.selectedAnswer ?? null,
      descriptiveAnswer: a.descriptiveAnswer ?? null,
      marks: typeof a.marks === "number" ? a.marks : parseFloat(a.marks) || 0,
      isCorrect: typeof a.isCorrect === "boolean" ? a.isCorrect : null,
      marksAwarded: typeof a.marksAwarded === "number" ? a.marksAwarded : null,
      teacherFeedback: a.teacherFeedback ?? undefined,
      needsReview: !!a.needsReview,
    }));

    // Compute derived stats when not provided
    let computedTotal = 0;
    let computedMax = 0;
    let computedCorrect = 0;
    let computedIncorrect = 0;
    let computedSkipped = 0;
    let hasDescriptive = false;

    answers.forEach((a) => {
      const marks = a.marks ?? 0;
      computedMax += marks;

      if (a.questionType === "descriptive") {
        hasDescriptive = true;
        // descriptive answers await review -> don't add to total
        if (!a.descriptiveAnswer) computedSkipped++;
      } else {
        // MCQ or unknown-> treat as MCQ
        if (a.selectedAnswer == null || (Array.isArray(a.selectedAnswer) && a.selectedAnswer.length === 0)) {
          computedSkipped++;
        } else {
          // If isCorrect provided, use it; otherwise compare using isCorrect === true
          if (a.isCorrect) {
            computedTotal += marks;
            computedCorrect++;
          } else {
            // if isCorrect is explicitly false, count incorrect
            computedIncorrect++;
          }
        }
      }
    });

    // prefer provided totals if present (frontend computes), otherwise use computed
    const totalScore = typeof providedTotalScore === "number" ? providedTotalScore : computedTotal;
    const maxScore = typeof providedMaxScore === "number" ? providedMaxScore : computedMax;
    const correctAnswers = typeof providedCorrect === "number" ? providedCorrect : computedCorrect;
    const incorrectAnswers = typeof providedIncorrect === "number" ? providedIncorrect : computedIncorrect;
    const skippedQuestions = typeof providedSkipped === "number" ? providedSkipped : computedSkipped;

    // Determine status
    const status = hasDescriptive ? "pending_review" : "reviewed";

    // Build document — use `new mongoose.Types.ObjectId(...)`
    const doc = new QuizSubmission({
      quizId: new mongoose.Types.ObjectId(quizId),
      userId: new mongoose.Types.ObjectId(userId),
      userName,
      userEmail,
      courseId: courseId ? new mongoose.Types.ObjectId(courseId) : undefined,
      subjectId: subjectId ? new mongoose.Types.ObjectId(subjectId) : undefined,
      quizTitle: quizTitle ?? "",
      answers: answers.map(a => ({
        questionId: a.questionId,
        questionType: (a.questionType === "descriptive" ? "descriptive" : "mcq"),
        selectedAnswer: a.selectedAnswer ?? undefined,
        descriptiveAnswer: a.descriptiveAnswer ?? undefined,
        marks: a.marks ?? 0,
        isCorrect: typeof a.isCorrect === "boolean" ? a.isCorrect : undefined,
        marksAwarded: typeof a.marksAwarded === "number" ? a.marksAwarded : undefined,
        teacherFeedback: a.teacherFeedback ?? undefined,
        needsReview: !!a.needsReview
      })),
      totalScore,
      maxScore,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      status,
      submittedAt: new Date(),
    });

    await doc.save();

    // If there are no descriptive questions, update the QuizScore (upsert)
    if (!hasDescriptive) {
      try {
        const filter = { userId: new mongoose.Types.ObjectId(userId), quizId: new mongoose.Types.ObjectId(quizId) };
        const existing = await QuizScore.findOne(filter).exec();

        if (!existing) {
          const qs = new QuizScore({
            userId: new mongoose.Types.ObjectId(userId),
            quizId: new mongoose.Types.ObjectId(quizId),
            score: totalScore,
            total: maxScore,
            takenAt: new Date(),
          });
          await qs.save();
        } else if (typeof existing.score === "number" && totalScore > existing.score) {
          existing.score = totalScore;
          existing.total = maxScore;
          existing.takenAt = new Date();
          await existing.save();
        }
      } catch (e) {
        console.warn("Failed to upsert QuizScore:", e);
      }
    }

    return NextResponse.json({ message: "Submission saved", submission: doc }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving quiz submission:", err);
    return NextResponse.json({ message: err?.message || "Server error" }, { status: 500 });
  }
}
