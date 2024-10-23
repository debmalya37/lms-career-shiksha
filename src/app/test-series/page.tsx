"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Question {
  question: string;
  options: string[];
}

interface Test {
  title: string; // You can set this as per your needs, maybe the subject or a static title
  questions: Question[];
}

export default function TestPage() {
  const [test, setTest] = useState<Test>({ title: 'Test', questions: [] });
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTestSeries = async () => {
      try {
        const response = await axios.get('/api/test-series');
        console.log('API Response:', response.data); // Log response for debugging

        if (Array.isArray(response.data)) {
          // Transform the response to fit the expected format
          const questions = response.data.map((item: any) => ({
            question: item.question,
            options: item.options,
          }));

          setTest({ title: 'Math Test', questions }); // Set the title accordingly
        } else {
          setError('Unexpected response format.');
        }
      } catch (error) {
        setError('Failed to fetch test series.');
        console.error('Error fetching test series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestSeries();
  }, []);

  const handleAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    console.log(answers);
    // Submit answers to the server
  };

  if (loading) return <p>Loading test series...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Check if questions are defined and have items before mapping
  if (!Array.isArray(test.questions) || test.questions.length === 0) {
    return <p>No questions available for this test.</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{test.title}</h1>
      {test.questions.map((q, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold mb-4">{q.question}</h3>
          <div className="flex space-x-4">
            {q.options.map((option) => (
              <button
                key={option}
                className={`py-2 px-4 rounded-md ${
                  answers[index] === option ? 'bg-blue-600 text-white' : 'bg-gray-200'
                } hover:bg-blue-500`}
                onClick={() => handleAnswer(index, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-8 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
      >
        Submit Test
      </button>
    </div>
  );
}
