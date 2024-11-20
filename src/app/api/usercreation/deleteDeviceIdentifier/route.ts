// /api/user/deleteDeviceIdentifier.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json(); // Extract userId from the request body
    await connectMongo();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.deviceIdentifier = null; // Clear the deviceIdentifier field
    await user.save();

    return NextResponse.json({ message: 'Device identifier deleted successfully!' });
  } catch (error) {
    console.error('Error deleting device identifier:', error);
    return NextResponse.json({ error: 'Failed to delete device identifier' }, { status: 500 });
  }
}
