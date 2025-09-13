// app/api/popup-notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import PopupNotification from '@/models/PopupNotification';
import dbConnect from '@/lib/db'; // Adjust path as needed

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'notification' },
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

// GET - Fetch active popup notifications
export async function GET() {
  try {
    await dbConnect();
    
    const notifications = await PopupNotification.find({ isActive: true })
      .sort({ date: -1 })
      .limit(10);
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching popup notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create new popup notification
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const image = formData.get('image') as File | null;
    
    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }
    
    let imageUrl = '';
    
    if (image && image.size > 0) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        imageUrl = await uploadToCloudinary(buffer);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }
    
    const notification = new PopupNotification({
      title,
      imageUrl,
      date: new Date(date),
      isActive: true,
    });
    
    await notification.save();
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating popup notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete popup notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const deletedNotification = await PopupNotification.findByIdAndDelete(id);
    
    if (!deletedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

// PATCH - Update notification status
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { isActive } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const updatedNotification = await PopupNotification.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!updatedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}