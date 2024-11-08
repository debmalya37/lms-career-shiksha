"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);

  // Fetch the notes from the server
  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch('/api/notes');
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    }

    fetchNotes();
  }, []);

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
              notes.map((note:any) => (
                <tr key={note._id} className="border-b">
                  <td className="px-4 py-2">{note.title}</td>
                  {/* Access the subject name instead of the whole subject object */}
                  <td className="px-4 py-2">{note.subject?.name || 'Unknown Subject'}</td>
                  <td className="px-4 py-2">
                    <Link href={note.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
