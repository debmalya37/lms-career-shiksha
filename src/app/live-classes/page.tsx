"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";

// Define a Zod schema for LiveClass
const liveClassSchema = z.object({
  _id: z.string(),
  title: z.string(),
  url: z.string().regex(/^https:\/\/www\.youtube\.com\/embed\//, {
    message: "URL must be a valid YouTube embed link",
  }),
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

export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        // Fetch user profile to get courses
        const profileRes = await axios.get(`https://civilacademyapp.com/api/profile`, {
          withCredentials: true,
        });
        const profile = profileRes.data;

        if (profile.error || !profile.courses || profile.courses.length === 0) {
          throw new Error("User does not have any subscribed courses.");
        }

        // Get user course IDs
        const courseIds = profile.courses.map((course: { _id: string }) => course._id);
        console.log("User's course IDs:", courseIds);

        // Fetch live classes for the user's courses
        const liveClassesRes = await axios.get(
          `https://civilacademyapp.com/api/live-classes?courseIds=${courseIds.join(",")}`
        );
        const liveClassesData = liveClassesRes.data;

        // Validate and filter live classes using Zod
        const filteredLiveClasses = liveClassesData.filter((liveClass: LiveClass) => {
          const result = liveClassSchema.safeParse(liveClass);
          return result.success;
        });

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
    <div className="container mx-auto py-8 bg-yellow-100 pr-5 pl-5 h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Classes</h1>
      <div className="flex flex-col gap-8">
        {liveClasses.length === 0 && !loading && <p>No valid live classes found.</p>}
        {liveClasses.map((liveClass) => {
          // Extract video ID for chat URL
          const videoId = liveClass.url.match(/\/embed\/([a-zA-Z0-9_-]+)/)?.[1];
          const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;

          return (
            <div key={liveClass._id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-4">{liveClass.title}</h3>
              <p className="text-gray-600 mb-4">Course: {liveClass.course.title}</p>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <iframe
                    title={liveClass.title}
                    className="w-full h-[400px] md:h-[500px]"
                    src={liveClass.url}
                    sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
                    allowFullScreen
                  />
                </div>
                <div className="flex-none lg:w-[350px] lg:h-[500px]">
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
