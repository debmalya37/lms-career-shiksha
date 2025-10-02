'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/meetlinks/for-user')
      .then(res => setMeetLinks(res.data))
      .catch(err => console.error('Failed to fetch meet links', err))
      .finally(() => setLoading(false));
  }, []);

  const openInNewTab = (url: string) => window.open(url, '_blank');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-gray-900">
          Your Course Sessions
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : meetLinks.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No meeting links available for your courses.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {meetLinks.map(link => (
              <div
                key={link._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48">
                  {link.thumbnail ? (
                    <img
                      src={link.thumbnail}
                      alt={link.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg font-medium">
                      No Thumbnail
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/70 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Card content */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {link.title}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-3">
                      Join your session anytime by clicking the button below.
                    </p>
                  </div>

                  <button
                    onClick={() => openInNewTab(link.link)}
                    className="mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl font-medium text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Join Now
                    <ExternalLink className="w-5 h-5" />
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
