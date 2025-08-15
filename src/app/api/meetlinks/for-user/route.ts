import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MeetLink from '@/models/meetLink';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from '@/models/user';

export async function GET(req: NextRequest) {
  await dbConnect();
  const sessionToken = req.cookies.get('sessionToken')?.value;
      if (!sessionToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const user = await User.findOne({ sessionToken }).lean();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const courseIds = user.course;
  const links = await MeetLink.find({ courseIds: { $in: courseIds } });
  return NextResponse.json(links);
}
