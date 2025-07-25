// app/api/invoice/[transactionId]/[courseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import connectMongo from "@/lib/db";
import Course, { ICourse } from "@/models/courseModel";
import  { User } from "@/models/user";
import Profile, { IProfile } from "@/models/profileModel";
import { Types } from "mongoose";
import path from 'path'
import { readFileSync } from 'fs'



export async function GET(req: NextRequest) {
  // Extract from the URL path
  const segments = req.nextUrl.pathname.split("/");
  const courseId      = segments.pop()!;
  const transactionId = segments.pop()!;

  if (!transactionId || !courseId) {
    return NextResponse.json(
      { error: "Missing transactionId or courseId" },
      { status: 400 }
    );
  }

  // 1) Connect DB
  await connectMongo();

  // 2) Auth: find user by sessionToken
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userDoc = sessionToken
    ? (await User.findOne({ sessionToken }).lean()) as User | null
    : null;
  if (!userDoc) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 3) Profile
  const profileDoc = (await Profile.findOne({ userId: userDoc._id }).lean()) as
    | IProfile
    | null;

  // 4) Course
  const courseDoc = (await Course.findById(courseId).lean()) as ICourse | null;
  if (!courseDoc) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // 5) Build PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers: Buffer[] = [];
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf')
doc.font(fontPath)
  doc.on("data", (b) => buffers.push(b));
  const pdfEnd = new Promise<Buffer>((res) =>
    doc.on("end", () => res(Buffer.concat(buffers)))
  );

  // Header
  doc.fontSize(20).text("Civil Academy", { align: "center" }).moveDown(1);

  // Invoice metadata
  doc
    .fontSize(12)
    .text(`Invoice Date: ${new Date().toLocaleDateString()}`)
    .text(`Transaction ID: ${transactionId}`)
    .moveDown(1);

  // Payer
  doc.fontSize(14).text("Payer Details", { underline: true }).moveDown(0.5);
  doc.fontSize(12)
    .text(`Name: ${profileDoc?.firstName || userDoc.name}`)
    .text(`Email: ${profileDoc?.email || userDoc.email}`)
    .moveDown(1);

  // Course
  doc.fontSize(14).text("Course Purchased", { underline: true }).moveDown(0.5);
  doc.fontSize(12)
    .text(`Title: ${courseDoc.title}`)
    .text(`Description: ${courseDoc.description.slice(0, 100)}...`)
    .moveDown(1);

  // Payment
  doc.fontSize(14).text("Payment Info", { underline: true }).moveDown(0.5);
  doc.fontSize(12)
    .text("Method: PhonePe")
    .text(`Amount: ₹—`) // if you persist amount, insert it here
    .moveDown(2);

  doc.fontSize(10).fillColor("gray").text(
    "Thank you for your purchase!",
    { align: "center" }
  );

  doc.end();
  const pdfBuffer = await pdfEnd;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="invoice_${transactionId}.pdf"`,
    },
  });
}
