"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function NotesPage() {
  const { subject } = useParams();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch(`/api/notes?subject=${subject}`);
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    }

    fetchNotes();
  }, [subject]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notes for {subject}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length > 0 ? (
          notes.map((note:any) => (
            <div key={note._id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-4">{note.title}</h3>
              <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Note
              </a>
            </div>
          ))
        ) : (
          <p>No notes found for {subject}.</p>
        )}
      </div>
    </div>
  );
}
