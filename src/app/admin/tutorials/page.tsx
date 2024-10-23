"use client";
import { useState } from 'react';
import axios from 'axios';

const ManageTutorials = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/tutorials', { title, url }); // POST request to the API
      setTitle(''); // Clear the title input
      setUrl(''); // Clear the URL input
      alert('Tutorial video added successfully!'); // Success message
    } catch (error) {
      console.error(error);
      alert('Error adding tutorial video.'); // Error message
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Tutorial Video</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (YouTube Embed)</label>
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
          Add Tutorial Video
        </button>
      </form>
    </div>
  );
};

export default ManageTutorials;
