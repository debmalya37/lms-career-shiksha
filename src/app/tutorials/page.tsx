"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TutorialsPage() {
  // Declare state for tutorials, loading, and error
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await axios.get('/api/tutorials'); // Fetch data from the API
        setTutorials(response.data); // Update state with fetched data
      } catch (error) {
        setError('Failed to fetch tutorials.'); // Set error message
        console.error('Error fetching tutorials:', error); // Log error
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchTutorials(); // Call the function to fetch tutorials
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tutorials</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((video:any) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-4">{video.title}</h3>
            <iframe
              title={video.title}
              className="w-full h-48"
              src={video.url}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </div>
  );
}
