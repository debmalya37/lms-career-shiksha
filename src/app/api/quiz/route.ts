import { NextRequest, NextResponse } from 'next/server';
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
    const title = formData.get('title') as string;
    const course = formData.get('course') as string;
    const subject = formData.get('subject') as string;
    const negativeMarking = parseFloat(formData.get('negativeMarking') as string);
    const totalTime = parseFloat(formData.get('totalTime') as string);
    const questionsData = formData.getAll('questions') as string[]; // Parse JSON strings
    const questionImages = formData.getAll('questionImages') as File[]; // Get files

    const questions = JSON.parse(questionsData[0]); // Assuming one JSON array string in the formData

    // Upload images and attach URLs to the questions
    const questionsWithImages = await Promise.all(
      questions.map(async (question: any, index: number) => {
        if (questionImages[index]) {
          const buffer = await questionImages[index].arrayBuffer();
          const imageUrl = await uploadToCloudinary(Buffer.from(buffer));
          return { ...question, image: imageUrl };
        }
        return question;
      })
    );

    const newQuiz = new Quiz({
      title,
      course,
      subject,
      questions: questionsWithImages,
      negativeMarking,
      totalTime,
    });

    await newQuiz.save();

    return NextResponse.json({ message: 'Quiz added successfully!' });
  } catch (error) {
    console.error('Error adding quiz:', error);
    return NextResponse.json({ error: 'Failed to add quiz' }, { status: 500 });
  }
}



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const subjectId = searchParams.get('subjectId');
  const quizId = searchParams.get('quizId'); // Get quizId from searchParams

  try {
    await connectMongo();

    let quizzes;

    if (quizId) {
      // Fetch specific quiz by ID, optionally filtered by courseId and subjectId
      quizzes = await Quiz.findOne({ 
        _id: quizId, 
        ...(courseId && { course: courseId }), 
        ...(subjectId && { subject: subjectId }) 
      }).lean();
    } else if (courseId || subjectId) {
      // Fetch quizzes filtered by courseId or subjectId
      quizzes = await Quiz.find({ 
        ...(courseId && { course: courseId }), 
        ...(subjectId && { subject: subjectId }) 
      }).lean();
    } else {
      // Fetch all quizzes without filters
      quizzes = await Quiz.find({}).lean();
    }

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quiz data:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz data' }, { status: 500 });
  }
}
