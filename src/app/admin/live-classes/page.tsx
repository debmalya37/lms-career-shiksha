"use client";
import { useState } from 'react';
import axios from 'axios';

const ManageLiveClasses = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/live-classes', { title, url });
      setTitle('');
      setUrl('');
      alert('Live stream added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding live stream.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Live Class Stream</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Stream Title</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Stream URL</label>
          <input
          title='url'
            type="text"
            className="border p-2 w-full rounded-md"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Live Stream
        </button>
      </form>
    </div>
  );
};

export default ManageLiveClasses;
