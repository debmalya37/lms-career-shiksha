"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Note {
  _id: string;
  title: string;
  url: string;
  subject: { name: string } | null; // Handle populated or non-populated subject
}

interface Course {
  _id: string;
  title: string;
  subjects: string[]; // Array of subject IDs
}

interface UserProfile {
  name: string;
  email: string;
  courses: Course[]; // Array of user courses
  subscription: number;
  error: any;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notes under user's subscribed subjects
  useEffect(() => {
    async function fetchNotesForUser() {
      try {
        const res = await fetch(`https://civilacademyapp.com/api/profile`, {
          method: "GET",
          credentials: "include",
        });
        const profile: UserProfile = await res.json();

        if (!profile.error && profile.courses?.length > 0) {
          console.log("User courses:", profile.courses);

          // Extract subject IDs from all user courses
          const subjectIds = profile.courses.flatMap((course) => course.subjects);

          if (subjectIds.length > 0) {
            console.log("Subject IDs:", subjectIds);

            // Fetch notes filtered by subject IDs
            const notesRes = await fetch(
              `https://civilacademyapp.com/api/notes/specific?subject=${subjectIds.join(",")}`
            );
            const fetchedNotes = await notesRes.json();

            console.log("Fetched notes:", fetchedNotes);
            setNotes(fetchedNotes);
          } else {
            console.warn("No subjects found for the user's courses.");
          }
        } else {
          console.error("Profile data error or no courses found.");
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
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 h-[100vh] bg-yellow-100 pr-5 pl-5">
      <h1 className="text-3xl font-bold text-black mb-6">Notes</h1>
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <table className="min-w-full text-left table-auto text-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {notes.length > 0 ? (
              notes.map((note) => (
                <tr key={note._id} className="border-b">
                  <td className="px-4 py-2">{note.title}</td>
                  <td className="px-4 py-2">{note.subject?.name || "Unknown Subject"}</td>
                  <td className="px-4 py-2">
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
                <td colSpan={3} className="px-4 py-2 text-center">
                  No notes available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
