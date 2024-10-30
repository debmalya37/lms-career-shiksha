// app/course/[courseId]/[subjectId]/page.tsx
"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SubjectPage({ params }: { params: { courseId: string; subjectId: string } }) {
  const [topics, setTopics] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [testSeries, setTestSeries] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsResponse, ebooksResponse, testSeriesResponse] = await Promise.all([
          axios.get(`/api/topics?subject=${params.subjectId}`),
          axios.get(`/api/ebook?subject=${params.subjectId}`),
          axios.get(`/api/test-series?course=${params.courseId}&subject=${params.subjectId}`)
        ]);

        setTopics(topicsResponse.data);
        setEbooks(ebooksResponse.data);
        setTestSeries(testSeriesResponse.data);
      } catch (error) {
        console.error("Error fetching topics, eBooks, or Test Series:", error);
        setError("Failed to load data.");
      }
    };
    fetchData();
  }, [params.subjectId, params.courseId]);

  return (
    <div className="container mx-auto py-8 bg-white min-h-screen rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Topics, eBooks, and Test Series in Subject</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Topics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Topics</h2>
        <ul className="list-disc pl-5 space-y-3">
          {topics.length > 0 ? (
            topics.map((topic: any) => (
              <li key={topic._id} className="text-black hover:text-blue-700">
                <Link href={`/courses/${params.courseId}/${params.subjectId}/${topic._id}`}>
                  <span>{topic.name}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No topics found for this subject.</li>
          )}
        </ul>
      </div>

      {/* eBooks Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">eBooks</h2>
        <ul className="list-disc pl-5 space-y-3">
          {ebooks.length > 0 ? (
            ebooks.map((ebook: any) => (
              <li key={ebook._id} className="text-black hover:text-blue-700">
                <a href={ebook.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {ebook.title}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No eBooks found for this subject.</li>
          )}
        </ul>
      </div>

      {/* Test Series Section */}
      <div>
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Test Series</h2>
        <ul className="list-disc pl-5 space-y-3">
          {testSeries.length > 0 ? (
            testSeries.map((test: any) => (
              <li key={test._id} className="text-black hover:text-blue-700">
                <a href={test.googleFormLink} target="_blank" rel="noopener noreferrer" className="underline">
                  {test.title}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No Test Series found for this subject.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
