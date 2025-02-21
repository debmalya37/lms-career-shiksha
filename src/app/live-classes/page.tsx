"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import DisableRightClickAndClipboard from "@/components/DisableRightClick";
import MobileClipboardFunction from "@/components/MobileClipboard";
import LiveClassVideoPlayer from "@/components/LiveClassVideoPlayer";


// Define a Zod schema for LiveClass
const liveClassSchema = z.object({
  _id: z.string(),
  title: z.string(),
  url: z.string(),
  course: z.object({
    _id: z.string(),
    title: z.string(),
  }),
});

interface LiveClass {
  _id: string;
  title: string;
  url: string;
  course: { _id: string; title: string };
}

interface UserProfile {
  email: string;
  phoneNo: string;
  courses: { _id: string }[];
}

// Function to convert YouTube URLs to nocookie embed format
const convertToNoCookieEmbedUrl = (url: string): string => {
  const embedUrlRegex = /^https:\/\/www\.youtube-nocookie\.com\/embed\//;
  const normalUrlRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
  const liveUrlRegex = /^https:\/\/(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)/;

  if (embedUrlRegex.test(url)) {
    // If already a nocookie embed URL, return as is
    return url;
  }

  const normalMatch = url.match(normalUrlRegex);
  if (normalMatch) {
    const videoId = normalMatch[1];
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }

  const liveMatch = url.match(liveUrlRegex);
  if (liveMatch) {
    const videoId = liveMatch[1];
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }

  return url; // Return as is if it's not a recognizable YouTube URL
};

export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        // Fetch user profile to get courses and user details
        const profileRes = await axios.get(`/api/profile`, {
          withCredentials: true,
        });
        const profile = profileRes.data;

        if (profile.error || !profile.courses || profile.courses.length === 0) {
          throw new Error("User does not have any subscribed courses.");
        }

        setUserProfile({
          email: profile.email,
          phoneNo: profile.phoneNo,
          courses: profile.courses,
        });

        // Get user course IDs
        const courseIds = profile.courses.map((course: { _id: string }) => course._id);
        console.log("User's course IDs:", courseIds);

        // Fetch live classes for the user's courses
        const liveClassesRes = await axios.get(
          `/api/live-classes?courseIds=${courseIds.join(",")}`
        );
        const liveClassesData = liveClassesRes.data;

        // Validate and filter live classes using Zod, then convert URLs to nocookie embed format
        const filteredLiveClasses = liveClassesData
          .filter((liveClass: LiveClass) => liveClassSchema.safeParse(liveClass).success)
          .map((liveClass: LiveClass) => ({
            ...liveClass,
            url: convertToNoCookieEmbedUrl(liveClass.url),
          }));

        setLiveClasses(filteredLiveClasses);
      } catch (err) {
        setError("Failed to fetch live classes.");
        console.error("Error fetching live classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading live classes...</p>
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
    
    <div className="container mx-auto py-8 bg-gradient-to-b from-gray-100 to-blue-100 pr-5 pl-5 h-[110vh] pb-2 mb-40">
      <DisableRightClickAndClipboard/>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Classes</h1>
      
      <div className="flex flex-col gap-8">
        {liveClasses.map((liveClass) => {
          const videoId = liveClass.url.match(/(?:embed\/|v=|live\/)([a-zA-Z0-9_-]+)/)?.[1];
          const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;

          return (
            <div key={liveClass._id} className="bg-white rounded-lg shadow-md p-4 h-[110vh]">
              <h3 className="text-xl font-semibold mb-4">{liveClass.title}</h3>
              <p className="text-gray-600 mb-4">Course: {liveClass.course.title}</p>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <LiveClassVideoPlayer url={liveClass.url} />
                </div>
                <div className="flex-none w-full lg:w-[350px] h-[350px] sm:h-[500px] md:h-[550px]">
                  <iframe
                    title={`${liveClass.title} - Live Chat`}
                    className="w-full h-full"
                    src={chatUrl}
                    sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-popups allow-modals"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
