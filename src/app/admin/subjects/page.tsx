"use client";
import { useState } from 'react';
import axios from 'axios';

const ManageSubjects = () => {
  const [subjectName, setSubjectName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/subjects', { name: subjectName });
      setSubjectName('');
      alert('Subject added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding subject.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Subject</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
          <input
            title='subjectName'
            type="text"
            className="border p-2 w-full rounded-md"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
          Add Subject
        </button>
      </form>
    </div>
  );
};

export default ManageSubjects;
