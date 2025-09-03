"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface MeetLink {
  _id: string;
  title: string;
  link: string;
  courseIds: string[];
  createdAt: string;
}

export default function MeetLauncher() {
  const [code, setCode] = useState("");
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [meetLinks, setMeetLinks] = useState<MeetLink[]>([]);

  useEffect(() => {
    axios.get("/api/meetlinks/for-user")
      .then(res => setMeetLinks(res.data))
      .catch(err => console.error("Failed to fetch meet links", err));
  }, []);

  const handleJoin = () => {
    const trimmed = code.trim();
    if (!/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(trimmed)) {
      alert("Please enter a valid Meet code (xxx-xxxx-xxx).");
      return;
    }
    setEmbedSrc(`https://meet.google.com/${trimmed}`);
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Join Seminar or Webinar or Any doubt Clearing Sessions</h1>

        {/* <div className="flex justify-center items-center space-x-2 mb-6">
          <input
            type="text"
            placeholder="abc-defg-hij"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="border rounded px-3 py-2 w-48 focus:outline-none focus:ring"
          />
          <button
            onClick={handleJoin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Join
          </button>
        </div> */}

        {/* List of user-related Meet links */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Your Course Sessions</h2>
          {meetLinks.length === 0 ? (
            <p className="text-gray-500">No meeting links available for your courses.</p>
          ) : (
            <ul className="space-y-4">
              {meetLinks.map(link => (
                <li
                  key={link._id}
                  className="border p-4 rounded-lg shadow bg-white flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-lg">{link.title}</h3>
                    {/* <p className="text-sm text-gray-600">{link.link}</p> */}
                  </div>
                  <button
                    onClick={() => openInNewTab(link.link)}
                    className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                  >
                    Join Now
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Embed if manually joined */}
        {embedSrc && (
          <div className="mt-10">
            <div className="text-sm mb-2">
              If embedding is blocked,{" "}
              <button
                onClick={() => openInNewTab(embedSrc)}
                className="text-blue-600 underline"
              >
                open in new tab
              </button>
              .
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={embedSrc}
                allow="camera; microphone; fullscreen"
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
