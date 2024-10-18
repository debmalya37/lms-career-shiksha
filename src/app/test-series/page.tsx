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
    <div>
      <h1>{test.title}</h1>
      {test.questions.map((q, index) => (
        <div key={index}>
          <h3>{q.question}</h3>
          {q.options.map((option) => (
            <button key={option} onClick={() => handleAnswer(index, option)}>
              {option}
            </button>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
