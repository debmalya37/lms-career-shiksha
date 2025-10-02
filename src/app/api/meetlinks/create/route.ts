// /api/meetlinks/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MeetLink from "@/models/meetLink";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "meetlink", format: "jpg", quality: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || "");
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const formData = await req.formData();
  const title = formData.get("title")?.toString() || "";
  const link = formData.get("link")?.toString() || "";
  const courseIds = formData.getAll("courseIds") as string[]; // multiple checkboxes

  const file = formData.get("thumbnail") as File | null;

  if (!title || !link || courseIds.length === 0) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    let thumbnailUrl = "";
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      thumbnailUrl = await uploadToCloudinary(buffer);
    }

    const saved = await MeetLink.create({
      title,
      link,
      courseIds,
      thumbnail: thumbnailUrl,
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
