"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function EBookPage() {
  const { subject } = useParams();
  const [ebooks, setEbooks] = useState([]);

  useEffect(() => {
    async function fetchEBooks() {
      try {
        const res = await fetch(`/api/ebook?subject=${subject}`);
        const data = await res.json();
        setEbooks(data);
      } catch (error) {
        console.error('Failed to fetch eBooks:', error);
      }
    }

    fetchEBooks();
  }, [subject]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-6">eBooks for {subject}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ebooks.length > 0 ? (
          ebooks.map((ebook:any) => (
            <div key={ebook._id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{ebook.title}</h3>
              <a href={ebook.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View eBook
              </a>
            </div>
          ))
        ) : (
          <p>No eBooks found for {subject}.</p>
        )}
      </div>
    </div>
  );
}
