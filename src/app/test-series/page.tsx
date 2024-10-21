"use client";
import React, { useState } from 'react';

const test = {
  title: 'Sample Test',
  questions: [
    {
      question: 'What is 2 + 2?',
      options: ['2', '3', '4', '5'],
    },
    {
      question: 'What is the capital of France?',
      options: ['Paris', 'London', 'Rome', 'Berlin'],
    },
  ],
};

export default function TestPage() {
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    console.log(answers);
    // Submit answers to the server
  };

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
                className={`py-2 px-4 rounded-md shadow-md ${
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
        className="mt-8 bg-blue-600 text-white py-2 px-6 rounded-md shadow-md hover:bg-blue-700"
      >
        Submit Test
      </button>
    </div>
  );
}
