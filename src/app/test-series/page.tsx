"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface TestSeries {
  title: string;
  googleFormLink: string;
  course: { title: string };
  subject: { name: string };
}

export default function TestPage() {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTestSeries = async () => {
      try {
        const response = await axios.get(`/api/test-series`);
        setTestSeries(response.data);
      } catch (error) {
        setError('Failed to fetch test series.');
        console.error('Error fetching test series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestSeries();
  }, []);

  if (loading) return <p>Loading test series...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto py-8 bg-gradient-to-b from-gray-100 to-blue-100 pr-5 pl-5 h-[100vh]">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Series</h1>
      {testSeries.map((test, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold mb-4">{test.title}</h3>
          <p className="text-gray-600 mb-2">Course: {test.course?.title}</p>
          <p className="text-gray-600 mb-2">Subject: {test.subject?.name}</p>
          {test.googleFormLink && (
            <Link
              href={test.googleFormLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Access Google Form
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
