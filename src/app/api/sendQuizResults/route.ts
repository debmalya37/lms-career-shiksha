import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const { quizTitle, score, correctAnswers, incorrectAnswers, userName, userEmail } = await request.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "debmalyasen37@gmail.com",
    subject: `Quiz Results: ${quizTitle}`,
    text: `
      Quiz Title: ${quizTitle}
      User Name: ${userName}
      User Email: ${userEmail}
      Score: ${score}
      Correct Answers: ${correctAnswers}
      Incorrect Answers: ${incorrectAnswers}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Results sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send results" }, { status: 500 });
  }
}
