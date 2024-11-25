// /api/ebook/edit/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import EBook from "@/models/ebookModel";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "ebooks" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || "");
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function POST(request: Request) {
  try {
    await connectMongo();
    const formData = await request.formData();
    const _id = formData.get("_id") as string;
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const subject = formData.get("subject") as string;
    const ebookImgFile = formData.get("ebookImg") as File | null;

    const ebook = await EBook.findById(_id);
    if (!ebook) {
      return NextResponse.json({ error: "eBook not found" }, { status: 404 });
    }

    let ebookImgUrl = ebook.ebookImg; // Default to existing image
    if (ebookImgFile) {
      const buffer = await ebookImgFile.arrayBuffer();
      const bufferData = Buffer.from(buffer);
      ebookImgUrl = await uploadToCloudinary(bufferData);
    }

    // Update eBook fields
    ebook.title = title;
    ebook.url = url;
    ebook.subject = subject;
    ebook.ebookImg = ebookImgUrl;

    await ebook.save();
    return NextResponse.json({ message: "eBook updated successfully!" });
  } catch (error) {
    console.error("POST /api/ebooks/edit Error:", error);
    return NextResponse.json({ error: "Failed to update eBook" }, { status: 500 });
  }
}
