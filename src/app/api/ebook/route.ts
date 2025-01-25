import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import EBook from '@/models/ebookModel';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';




// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'ebooks' }, // Optional: remove if you don't need a folder
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
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
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const subject = formData.get('subject') as string;
    const ebookImgFile = formData.get('ebookImg') as File | null;

    let ebookImgUrl = '';
    if (ebookImgFile) {
      // Convert the File object to a Buffer for streaming
      const buffer = await ebookImgFile.arrayBuffer();
      const bufferData = Buffer.from(buffer);
      ebookImgUrl = await uploadToCloudinary(bufferData);
    }

    const newEBook = new EBook({
      title,
      url,
      subject,
      ebookImg: ebookImgUrl, // Save the Cloudinary image URL
    });

    await newEBook.save();
    return NextResponse.json({ message: 'eBook added successfully!' });
  } catch (error) {
    console.error("POST /api/ebook Error:", error);
    return NextResponse.json({ error: 'Failed to add eBook' }, { status: 500 });
  }
}


// Updated GET method to return lean POJO
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subject'); // Fetch subject ID if available

  try {
    await connectMongo();
    const query = subjectId ? { subject: subjectId } : {}; // Filter by subject if provided
    const ebooks = await EBook.find(query).populate('subject', 'name').lean(); // Use .lean() to return POJOs
    return NextResponse.json(ebooks);
  } catch (error) {
    console.error("GET /api/ebook Error:", error);
    return NextResponse.json({ error: 'Failed to fetch eBooks' }, { status: 500 });
  }
}
