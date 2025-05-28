// app/api/chat/getLiveChatId/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createOAuthClient } from "@/lib/googleClient";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const videoId = url.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  const oAuth2 = createOAuthClient(req);
  const youtube = google.youtube({ version: "v3", auth: oAuth2 });

  // fetch the liveStreamingDetails.activeLiveChatId
  const resp = await youtube.videos.list({
    part: ["liveStreamingDetails"],
    id: [videoId],
  });

  const details = resp.data.items?.[0]?.liveStreamingDetails;
  if (!details?.activeLiveChatId) {
    return NextResponse.json(
      { error: "No activeLiveChatId (either not live or no chat)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ liveChatId: details.activeLiveChatId });
}
