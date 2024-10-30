// api/ebook/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import EBook from '@/models/ebookModel';

export async function POST(request: Request) {
  const { title, url, subject } = await request.json();

  try {
    await connectMongo();
    const newEBook = new EBook({ title, url, subject }); // Use subject ID directly
    await newEBook.save();

    return NextResponse.json({ message: 'eBook added successfully!' });
  } catch (error) {
    console.error("POST /api/ebook Error:", error);
    return NextResponse.json({ error: 'Failed to add eBook' }, { status: 500 });
  }
}

// GET method to fetch eBooks, with optional subject-based filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subject'); // Fetch subject ID if available

  try {
    await connectMongo();
    const query = subjectId ? { subject: subjectId } : {}; // Filter by subject if provided
    const ebooks = await EBook.find(query).populate('subject', 'name'); // Populate subject name
    return NextResponse.json(ebooks);
  } catch (error) {
    console.error("GET /api/ebook Error:", error);
    return NextResponse.json({ error: 'Failed to fetch eBooks' }, { status: 500 });
  }
}
