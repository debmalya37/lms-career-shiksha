"use client";

import { useParams } from 'next/navigation';

export default function VideoDetailPage() {
  const { id } = useParams();

  // Here, you would ideally fetch the video data using the ID, but for simplicity:
  const video = {
    title: `Video Title ${id}`,
    description: `This is a detailed description of the video with id: ${id}.`,
    url: '#', // Placeholder for video URL or embed
  };

  return (
    <div className="min-h-screen bg-yellow-100">
      <div className="container mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center bg-green-700 text-white p-4">
          <div>Welcome Students name</div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/live-classes" className="hover:underline">Live Classes</a></li>
              <li><a href="/recorded-content" className="hover:underline">Recorded Content</a></li>
              <li><a href="/notes" className="hover:underline">Notes</a></li>
              <li><a href="/contact" className="hover:underline">Contact us</a></li>
            </ul>
          </nav>
        </header>

        {/* Search Bar */}
        <div className="mt-6 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search"
            className="block w-full p-2 rounded-md bg-green-100"
          />
        </div>

        {/* Video Section */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-red-200 w-full h-96 rounded-md"></div> {/* Placeholder for video player */}
        <h2 className="text-2xl font-bold mt-4">{video.title}</h2>
        <p className="mt-4 text-lg">{video.description}</p>
        </div>
    </div>

      {/* Footer */}
      <footer className="bg-green-700 text-white text-center p-4 mt-8">
        Copyright Civil Academy 2024
      </footer>
    </div>
  );
}
