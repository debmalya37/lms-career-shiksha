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
    const course = formData.get('course') as string;
    const subject = formData.get('subject') as string;
    const negativeMarking = parseFloat(formData.get('negativeMarking') as string);
    const totalTime = parseFloat(formData.get('totalTime') as string);
    const questionsData = formData.getAll('questions') as string[]; // Parse JSON strings
    const questionImages = formData.getAll('questionImages') as File[]; // Get files

    const questions = JSON.parse(questionsData[0]);

    // Upload images and attach URLs to the questions
    const updatedQuestions = await Promise.all(
      questions.map(async (question: any, index: number) => {
        if (questionImages[index]) {
          const buffer = await questionImages[index].arrayBuffer();
          const imageUrl = await uploadToCloudinary(Buffer.from(buffer));
          return { ...question, image: imageUrl };
        }
        return question;
      })
    );

    await Quiz.findByIdAndUpdate(quizId, {
      title,
      course,
      subject,
      questions: updatedQuestions,
      negativeMarking,
      totalTime,
    });

    return NextResponse.json({ message: 'Quiz updated successfully!' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
  }
}
