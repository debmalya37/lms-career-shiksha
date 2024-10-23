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
});

interface LiveClass {
  _id: string; // MongoDB document ID
  title: string;
  url: string;
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Classes</h1>
      {loading && <p>Loading live classes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveClasses.length === 0 && !loading && <p>No valid live classes found.</p>}
        {liveClasses.map((liveClass) => (
          <div key={liveClass._id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-2">{liveClass.title}</h3>
            <iframe
              title={liveClass.title}
              className="w-full h-64"
              src={liveClass.url}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </div>
  );
}
