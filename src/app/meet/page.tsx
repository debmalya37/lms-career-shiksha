'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface MeetLink {
  _id: string;
  title: string;
  link: string;
  courseIds: string[];
  thumbnail?: string;
  createdAt: string;
}

export default function MeetLauncher() {
  const [meetLinks, setMeetLinks] = useState<MeetLink[]>([]);

  useEffect(() => {
    axios.get('/api/meetlinks/for-user')
      .then(res => setMeetLinks(res.data))
      .catch(err => console.error("Failed to fetch meet links", err));
  }, []);

  const openInNewTab = (url: string) => window.open(url, '_blank');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">
          Your Course Sessions
        </h1>

        {meetLinks.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No meeting links available for your courses.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetLinks.map(link => (
              <div
                key={link._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {link.thumbnail ? (
                  <img
                    src={link.thumbnail}
                    alt={link.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                    No Thumbnail
                  </div>
                )}

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{link.title}</h2>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => openInNewTab(link.link)}
                    className="mt-auto bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Join Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
