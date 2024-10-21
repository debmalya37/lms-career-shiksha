import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/noteModel';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get('title');
  const file = formData.get('file') as File;

  try {
    await connectMongo(); // Establish DB connection

    // Save file to a local directory or cloud storage
    const filePath = path.join(process.cwd(), 'public/uploads', file.name);
    const fileStream = fs.createWriteStream(filePath);
    fileStream.write(Buffer.from(await file.arrayBuffer()));
    fileStream.end();

    const newNote = new Note({
      title,
      filePath, // Save the file path to the DB
    });

    await newNote.save();

    return NextResponse.json({ message: 'Note uploaded successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload note' }, { status: 500 });
  }
}
