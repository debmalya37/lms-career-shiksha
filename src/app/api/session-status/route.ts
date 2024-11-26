import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken');
  if (!sessionToken) {
    return NextResponse.json({ sessionActive: false });
  }
  // Validate sessionToken logic here
  return NextResponse.json({ sessionActive: true });
}
