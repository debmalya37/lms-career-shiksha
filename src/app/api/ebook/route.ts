import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import EBook from '@/models/ebookModel';

export async function POST(request: Request) {
  const { title, url, subject } = await request.json();

  try {
    await connectMongo(); // Ensure MongoDB connection

    const newEBook = new EBook({ title, url, subject });
    await newEBook.save();

    return NextResponse.json({ message: 'eBook added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add eBook' }, { status: 500 });
  }
}

// Handle GET requests to fetch eBooks, with optional subject-based filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject'); // Get the subject parameter from the query string

  try {
    await connectMongo(); // Ensure MongoDB connection

    const query = subject
      ? { subject: { $regex: new RegExp(subject, 'i') } } // Case-insensitive search
      : {}; // Fetch all eBooks if no subject is provided

    const ebooks = await EBook.find(query);
    return NextResponse.json(ebooks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch eBooks' }, { status: 500 });
  }
}
