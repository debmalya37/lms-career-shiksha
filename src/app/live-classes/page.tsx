"use client"; // Ensure this component can use hooks and client-side logic

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';

// Define a Zod schema for LiveClass
const liveClassSchema = z.object({
  _id: z.string(), // MongoDB document ID
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
  _id: string; // MongoDB document ID
  title: string;
  url: string;
  course: { _id: string; title: string }; // Include course details
}

export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        const response = await axios.get('/api/live-classes'); // Fetch live classes from API

        // Validate and filter live classes to only include valid YouTube embed URLs
        const filteredLiveClasses = response.data.filter((liveClass: LiveClass) => {
          // Validate using Zod
          const result = liveClassSchema.safeParse(liveClass);
          return result.success; // Only keep valid live classes
        });

        setLiveClasses(filteredLiveClasses); // Set fetched data to state
      } catch (error) {
        setError('Failed to fetch live classes.'); // Set error message
        console.error('Error fetching live classes:', error); // Log error
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    fetchLiveClasses(); // Call fetch function
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="container mx-auto py-8 bg-yellow-100 pr-5 pl-5 h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Classes</h1>
      {loading && <p>Loading live classes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col gap-8">
        {liveClasses.length === 0 && !loading && <p>No valid live classes found.</p>}
        {liveClasses.map((liveClass) => {
          // Extract the video ID from the YouTube embed URL
          const videoId = liveClass.url.match(/\/embed\/([a-zA-Z0-9_-]+)/)?.[1];
          const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;

          return (
            <div key={liveClass._id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-4">{liveClass.title}</h3>
              <p className="text-gray-600 mb-4">Course: {liveClass.course.title}</p> {/* Display course title */}
              {/* Flexbox layout for stream and chat */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Video Section */}
                <div className="flex-1">
                  <iframe
                    title={liveClass.title}
                    className="w-full h-[400px] md:h-[500px]"
                    src={liveClass.url}
                    sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
                    allowFullScreen
                  />
                </div>
                {/* Chat Section */}
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
