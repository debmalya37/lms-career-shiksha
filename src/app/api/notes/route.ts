import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/noteModel';
import cloudinary from '@/lib/cloudinary';
import { UploadApiResponse } from '@/types/cloudinary'; // Import Cloudinary API Response Type

// Helper function to convert ReadableStream (from browser) to Buffer
async function streamToBuffer(stream: ReadableStream) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  let result = await reader.read();
  while (!result.done) {
    chunks.push(result.value);
    result = await reader.read();
  }

  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get('title') as string;
  const file = formData.get('file') as File;

  try {
    await connectMongo();

    const fileBuffer = await streamToBuffer(file.stream());

    // Upload the file buffer to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'notes', resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadApiResponse); // Ensure proper type casting
          }
        }
      ).end(fileBuffer);
    });

    const newNote = new Note({
      title,
      url: uploadResult.secure_url, // Using the typed secure_url property
    });

    await newNote.save();

    return NextResponse.json({ message: 'Note uploaded successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload note' }, { status: 500 });
  }
}

// Handle GET request to fetch all notes
export async function GET() {
  try {
    await connectMongo(); // Connect to the DB

    const notes = await Note.find({}); // Fetch all notes

    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}
