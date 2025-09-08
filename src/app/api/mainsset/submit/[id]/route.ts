// app/api/mainsset/submit/[id]/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";
import MainsSet from "@/models/mainsSetModel";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// configure cloudinary (uses env vars like your other route)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinaryBuffer(buffer: Buffer, folder = "mainsset") {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result?.secure_url || "");
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const mainsId = params.id;
    if (!mainsId) return NextResponse.json({ error: "Missing mains set id" }, { status: 400 });

    const sessionToken = (request as any).cookies?.get?.("sessionToken")?.value ?? null;
    // Note: in route handlers (Request) cookies are available via request.headers, but in Next.js API routes we often accept cookies via Request here.
    // Fallback: try reading via Request.cookies? If unavailable, use formData to pass userId as meta.
    // We'll attempt to read cookie from headers:
    const cookieHeader = (request as any).headers?.get?.("cookie") || "";
    const tokenFromHeader = cookieHeader?.split(";").map((c: string) => c.trim()).find((c: string) => c.startsWith("sessionToken="));
    const sessionTokenFallback = tokenFromHeader ? tokenFromHeader.split("=")[1] : null;
    const token = sessionToken || sessionTokenFallback;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ sessionToken: token }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const mains = await MainsSet.findById(mainsId);
    if (!mains) return NextResponse.json({ error: "Mains set not found" }, { status: 404 });

    // parse multipart/form-data
    const formData = await request.formData();

    // fetch all question files by convention file_0, file_1, ...
    const answers: { questionId: number; answerFile: string }[] = [];

    for (let i = 0; i < (mains.questions?.length || 0); i++) {
      const file = formData.get(`file_${i}`) as File | null;
      if (file && typeof (file as any).arrayBuffer === "function") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadToCloudinaryBuffer(buffer, "mainsset");
        answers.push({ questionId: i, answerFile: url });
      }
    }

    if (answers.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // check if user already has a submission
    const existingIndex = mains.submissions.findIndex((s:any) => s.user.toString() === user._id.toString());

    if (existingIndex >= 0) {
      // replace answers + set status submitted
      mains.submissions[existingIndex].answers = answers.map(a => ({ ...a }));
      mains.submissions[existingIndex].status = "submitted";
      mains.submissions[existingIndex].reviewedAt = undefined;
      mains.submissions[existingIndex].totalMarks = 0;
    } else {
      mains.submissions.push({
        user: user._id,
        answers: answers.map(a => ({ ...a })),
        status: "submitted",
      } as any);
    }

    await mains.save();

    return NextResponse.json({ message: "Submitted successfully" });
  } catch (err) {
    console.error("POST /api/mainsset/submit/[id] error:", err);
    return NextResponse.json({ error: "Failed to submit answers" }, { status: 500 });
  }
}
