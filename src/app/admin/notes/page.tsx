"use client";
import { useState } from 'react';
import axios from 'axios';

const ManageNotes = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    if (file) {
      formData.append('file', file);
    }

    try {
      await axios.post('/api/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setFile(null);
      alert('Note uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Error uploading note.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Upload Notes</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Note Title</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
          <input title='file' type="file" className="border p-2 w-full rounded-md" onChange={handleFileChange} required />
        </div>

        <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
          Upload Note
        </button>
      </form>
    </div>
  );
};

export default ManageNotes;
