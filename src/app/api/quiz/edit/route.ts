import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Quiz from '@/models/quizModel';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload images to Cloudinary
async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'quizzes' },
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
    const quizId = formData.get('quizId') as string;
    const title = formData.get('title') as string;
    const courses = formData.getAll('courses') as string[];
    const subjects = formData.getAll('subjects') as string[];
    const negativeMarking = parseFloat(formData.get('negativeMarking') as string);
    const totalTime = parseFloat(formData.get('totalTime') as string);
    const questionsData = formData.getAll('questions') as string[];
    const questionImages = formData.getAll('questionImages') as File[];

    if (!quizId) {
      return NextResponse.json({ error: 'quizId is required' }, { status: 400 });
    }

    if (courses.length !== subjects.length) {
      return NextResponse.json(
        { error: 'courses[] and subjects[] length mismatch' },
        { status: 400 }
      );
    }

    const questions = JSON.parse(questionsData[0] || '[]');

    // Upload images and attach URLs by explicit index lookup
    const updatedQuestions = await Promise.all(
      questions.map(async (question: any, index: number) => {
        const fileField = formData.get(`questionImage_${index}`) as File | null;
        if (fileField) {
          const buffer = await fileField.arrayBuffer();
          const imageUrl = await uploadToCloudinary(Buffer.from(buffer));
          return { ...question, image: imageUrl };
        }
        // if no new upload, leave existing URL or undefined
        return question;
      })
    );


    await Quiz.findByIdAndUpdate(
      quizId,
      {
        title,
        course: courses,
        subject: subjects,
        questions: updatedQuestions,
        negativeMarking,
        totalTime,
      },
      { new: true }
    );

    return NextResponse.json({ message: 'Quiz updated successfully!' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
  }
}
