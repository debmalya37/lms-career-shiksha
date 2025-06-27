"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Note {
  _id: string;
  title: string;
  url: string;
  subject: { name: string } | null;
}

interface Subject {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  subjects: (Subject | string)[];
}

interface UserProfile {
  name: string;
  email: string;
  courses: Course[];
  subscription: number;
  error: any;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotesForUser() {
      try {
        const res = await fetch(`/api/profile`, {
          method: "GET",
          credentials: "include",
        });
        const profile: UserProfile = await res.json();

        if (!profile.error && profile.courses?.length > 0) {
          const subjectIds = profile.courses.flatMap((course) =>
            course.subjects.map((subject) =>
              typeof subject === "string" ? subject : subject._id
            )
          );

          if (subjectIds.length) {
            const notesRes = await fetch(
              `/api/notes/specific?subject=${subjectIds.join(",")}`
            );
            const fetchedNotes = await notesRes.json();
            setNotes(fetchedNotes);
          }
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotesForUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-950 to-gray-800">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 to-gray-800">
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
        <h1 className="text-3xl font-bold text-white mb-6">Notes</h1>
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-2 sm:px-4 py-2">Title</th>
                <th className="px-2 sm:px-4 py-2">Subject</th>
                <th className="px-2 sm:px-4 py-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {notes.length ? (
                notes.map((note) => (
                  <tr key={note._id} className="border-b hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 break-words">{note.title}</td>
                    <td className="px-2 sm:px-4 py-2">{note.subject?.name || "Unknown"}</td>
                    <td className="px-2 sm:px-4 py-2">
                      <Link
                        href={note.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-2 sm:px-4 py-2 text-center">
                    No notes available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      {/* The footer will come after this main, ensuring no overlap */}
    </div>
  );
}
