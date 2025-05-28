// app/live-classes/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import DisableRightClickAndClipboard from "@/components/DisableRightClick";
import MobileClipboardFunction from "@/components/MobileClipboard";
import LiveClassVideoPlayer from "@/components/LiveClassVideoPlayer";
import YouTubeChat from "@/components/YouTubeChat";
import LiveChat from '@/components/LiveChat';

// Zod schema
const liveClassSchema = z.object({
  _id: z.string(),
  title: z.string(),
  url: z.string(),
  course: z.object({
    _id: z.string(),
    title: z.string(),
  }),
});

// Augmented interface
interface LiveClass {
  _id: string;
  title: string;
  url: string;
  course: { _id: string; title: string };
  liveChatId?: string;   // ← we’ll fill this in
}

interface UserProfile {
  email: string;
  phoneNo: string;
  courses: { _id: string }[];
}

// Helper to normalize embed URL
const convertToNoCookieEmbedUrl = (url: string): string => {
  const embedUrlRegex = /^https:\/\/www\.youtube-nocookie\.com\/embed\//;
  const normalUrlRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/;
  const liveUrlRegex = /^https:\/\/(?:www\.)?youtube\.com\/live\/([A-Za-z0-9_-]+)/;

  if (embedUrlRegex.test(url)) return url;

  const m = url.match(normalUrlRegex) || url.match(liveUrlRegex);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;

  return url;
};

export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLiveClasses() {
      try {
        // 1) fetch profile
        const profileRes = await axios.get(`/api/profile`, { withCredentials: true });
        const profile = profileRes.data as UserProfile;
        if (!profile.courses?.length) {
          throw new Error("No subscribed courses");
        }

        // 2) fetch live‐classes data
        const ids = profile.courses.map((c) => c._id).join(",");
        const liveRes = await axios.get<LiveClass[]>(`/api/live-classes?courseIds=${ids}`);
        const raw = liveRes.data;

        // 3) zod‐filter + normalize URL
        const normalized: LiveClass[] = raw
          .filter((lc) => liveClassSchema.safeParse(lc).success)
          .map((lc) => ({ ...lc, url: convertToNoCookieEmbedUrl(lc.url) }));

        // 4) for each class, fetch its activeLiveChatId
        const withChatId = await Promise.all(
          normalized.map(async (lc) => {
            // extract videoId from embed URL
            const vid = lc.url.match(/embed\/([A-Za-z0-9_-]+)/)?.[1];
            if (!vid) return lc;
            try {
              const r = await axios.get<{ liveChatId: string }>(
                `/api/chat/getLiveChatId?videoId=${vid}`
              );
              return { ...lc, liveChatId: r.data.liveChatId };
            } catch {
              return lc; // leave undefined
            }
          })
        );

        setLiveClasses(withChatId);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to fetch live classes");
      } finally {
        setLoading(false);
      }
    }

    fetchLiveClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading live classes…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 bg-gradient-to-b from-gray-100 to-blue-100 px-5 mb-40">
      {/* <DisableRightClickAndClipboard /> */}
      {/* <MobileClipboardFunction /> */}

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Classes</h1>
      <div className="flex flex-col gap-8">
      {liveClasses.map((lc) => (
        <div key={lc._id} className="...">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{lc.title}</h3>
            <p className="text-gray-600 mb-4">Course: {lc.course.title}</p>
            <LiveClassVideoPlayer url={lc.url} />
          </div>
          <div className="flex-none w-full lg:w-80">
            <LiveChat channelId={lc._id} />
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
