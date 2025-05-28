// app/api/quiz/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Quiz from '@/models/quizModel';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Cloudinary setup (unchanged)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// helper to upload an image buffer
async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'quizzes' },
      (err, res) => (err ? reject(err) : resolve(res!.secure_url))
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function POST(request: Request) {
  try {
    await connectMongo();
    const formData = await request.formData();

    const title           = formData.get('title') as string;
    const courses         = formData.getAll('courses')  as string[];
    const subjects        = formData.getAll('subjects') as string[];
    const negativeMarking = parseFloat(formData.get('negativeMarking') as string);
    const totalTime       = parseFloat(formData.get('totalTime') as string);
    const questionsData   = formData.getAll('questions') as string[];
    const questionImages  = formData.getAll('questionImages') as File[];

    // must have same # of courses as subjects
    if (courses.length !== subjects.length) {
      return NextResponse.json(
        { error: 'courses[] and subjects[] length mismatch' },
        { status: 400 }
      );
    }

    // parse questions once
    const questions: any[] = JSON.parse(questionsData[0] || '[]');

    // upload any question images
    const questionsWithImages = await Promise.all(
      questions.map(async (q, idx) => {
        if (questionImages[idx]) {
          const buf = Buffer.from(await questionImages[idx].arrayBuffer());
          const url = await uploadToCloudinary(buf);
          return { ...q, image: url };
        }
        return q;
      })
    );

    // upsert logic: if quizId present, update; else create
    const quizId = formData.get('quizId') as string | null;
    let quizDoc;
    if (quizId) {
      quizDoc = await Quiz.findByIdAndUpdate(
        quizId,
        {
          title,
          course:         courses,
          subject:        subjects,
          negativeMarking,
          totalTime,
          questions:      questionsWithImages,
        },
        { new: true }
      );
    } else {
      quizDoc = new Quiz({
        title,
        course:         courses,
        subject:        subjects,
        negativeMarking,
        totalTime,
        questions:      questionsWithImages,
      });
      await quizDoc.save();
    }

    return NextResponse.json({ success: true, quiz: quizDoc });
  } catch (err: any) {
    console.error('quiz POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    const url       = new URL(request.url);
    // gather all ?courseId=... and ?subjectId=...
    const courseIds  = url.searchParams.getAll('courseId');
    const subjectIds = url.searchParams.getAll('subjectId');
    const quizId     = url.searchParams.get('quizId');

    // build filter
    const filter: any = {};
    if (quizId) filter._id = quizId;
    if (courseIds.length)  filter.course  = { $in: courseIds };
    if (subjectIds.length) filter.subject = { $in: subjectIds };

    const data = quizId
      ? await Quiz.findOne(filter).lean()
      : await Quiz.find(filter).lean();

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('quiz GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
