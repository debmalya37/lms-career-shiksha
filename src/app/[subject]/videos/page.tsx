"use client";
import { useEffect, useState } from 'react';
import VideoGrid from '@/components/VideoGrid';
import { useParams } from 'next/navigation';

export default function VideoPage() {
  const { subject } = useParams();
  const subjectString = Array.isArray(subject) ? subject[0] : subject;

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    async function fetchVideos() {
      const res = await fetch(`/api/videos?subject=${subjectString}`);
      const data = await res.json();
      setVideos(data);
    }

    fetchVideos();
  }, [subjectString]);

  return (
    <div className="bg-yellow-100 min-h-screen">
      <div className="container mx-auto">
        <input
          type="text"
          placeholder="Search"
          className="block w-full max-w-lg mt-6 mx-auto bg-green-100 p-2 rounded-md"
        />
        <h2 className="text-green-700 text-2xl font-bold mb-8 text-center">
          {subjectString} Videos
        </h2>
        <VideoGrid videos={videos} subject={subjectString} />
      </div>
    </div>
  );
}
