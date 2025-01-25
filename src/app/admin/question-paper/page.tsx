"use client";
import { useState } from 'react';
import axios from 'axios';

const ManageQuestionPapers = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');

  const subjects = ['Math', 'Science', 'History']; // Populate with actual subjects

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/api/question-paper`, { title, url, subject });
      setTitle('');
      setUrl('');
      setSubject('');
      alert('Question Paper added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding Question Paper.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Question Paper</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Paper Title</label>
          <input
            title='title'
            type="text"
            className="border p-2 w-full rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive URL</label>
          <input
            title='url'
            type="url"
            className="border p-2 w-full rounded-md"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
            title='subject'
            className="border p-2 w-full rounded-md"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Question Paper
        </button>
      </form>
    </div>
  );
};

export default ManageQuestionPapers;
