import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import BannerAd from '@/models/bannerAdModel';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload images to Cloudinary
async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'bannerAds' },
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

// POST: Add new banner ad
export async function POST(request: Request) {
  try {
    await connectMongo();
    const formData = await request.formData();
    const bannerImgFile = formData.get('bannerImg') as File | null;

    if (!bannerImgFile) {
      return NextResponse.json({ error: 'Banner image is required' }, { status: 400 });
    }

    // Convert the File object to a Buffer
    const buffer = await bannerImgFile.arrayBuffer();
    const bufferData = Buffer.from(buffer);

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(bufferData);

    // Save to database
    const newBannerAd = new BannerAd({ imageUrl });
    await newBannerAd.save();

    return NextResponse.json({ message: 'Banner ad added successfully!' });
  } catch (error) {
    console.error('POST /api/bannerAds Error:', error);
    return NextResponse.json({ error: 'Failed to add banner ad' }, { status: 500 });
  }
}

// GET: Fetch all banner ads
export async function GET() {
  try {
    await connectMongo();
    const bannerAds = await BannerAd.find().lean(); // Fetch all ads
    return NextResponse.json(bannerAds);
  } catch (error) {
    console.error('GET /api/bannerAds Error:', error);
    return NextResponse.json({ error: 'Failed to fetch banner ads' }, { status: 500 });
  }
}
