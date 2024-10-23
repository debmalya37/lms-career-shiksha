"use client"; // Ensure this component can use hooks and client-side logic

import { useState } from 'react';
import axios from 'axios';

const subjects = ['Math', 'Science', 'English']; // Example subjects

export default function AdminTestSeriesPage() {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']); // Four options
  const [subject, setSubject] = useState(subjects[0]); // Default to first subject

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/test-series', { question, correctAnswer, options, subject });
      // Reset fields after submission
      setQuestion('');
      setCorrectAnswer('');
      setOptions(['', '', '', '']);
      alert('Test series question added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding test series question.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8  text-black" >
      <h1 className="text-2xl font-bold mb-4">Add Test Series Question</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <input
          title='question'
            type="text"
            className="border p-2 w-full rounded-md text-black"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
          <input
          title='correct-ans'
            type="text"
            className="border p-2 w-full rounded-md  text-black"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          {options.map((option, index) => (
            <input
            title='options'
              key={index}
              type="text"
              className="border p-2 w-full rounded-md mb-2  text-black "
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required
            />
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm  font-medium text-gray-700 mb-2">Subject</label>
          <select
          title='subjects'
            className="border p-2 w-full rounded-md  text-black"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Question
        </button>
      </form>
    </div>
  );
}
