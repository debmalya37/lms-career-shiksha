// app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
const YT_KEY = process.env.YOUTUBE_API_KEY!;

export async function GET(req: NextRequest) {
  const url        = new URL(req.url);
  const liveChatId = url.searchParams.get("liveChatId");
  const pageToken  = url.searchParams.get("pageToken") ?? "";

  if (!liveChatId) {
    return NextResponse.json({ error: "liveChatId required" }, { status: 400 });
  }

  // Build the YouTube Data API URL
  const apiUrl = new URL("https://www.googleapis.com/youtube/v3/liveChat/messages");
  apiUrl.searchParams.set("liveChatId", liveChatId);
  apiUrl.searchParams.set("part", "snippet,authorDetails");
  apiUrl.searchParams.set("key", YT_KEY);
  if (pageToken) apiUrl.searchParams.set("pageToken", pageToken);

  const resp = await fetch(apiUrl.toString());
  if (!resp.ok) {
    const err = await resp.json();
    return NextResponse.json(err, { status: resp.status });
  }
  const data = await resp.json();
  return NextResponse.json(data);
}
