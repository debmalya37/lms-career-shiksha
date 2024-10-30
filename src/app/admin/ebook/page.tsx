"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageEBooks = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subjects, setSubjects] = useState([]); // Stores fetched subjects
  const [selectedSubject, setSelectedSubject] = useState(''); // Selected subject ID

  // Fetch subjects from the API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/api/subjects');
        setSubjects(response.data); // Populate subjects from response
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ebookData = { title, url, subject: selectedSubject }; // Payload with subject ID

    try {
      await axios.post('/api/ebook', ebookData);
      setTitle('');
      setUrl('');
      setSelectedSubject('');
      alert('eBook added successfully!');
    } catch (error) {
      console.error('Error adding eBook:', error);
      alert('Error adding eBook.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Add eBook</h1>
      <form onSubmit={handleSubmit}>
        {/* eBook Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">eBook Title</label>
          <input
          title='text'
            type="text"
            className="border p-2 w-full rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Google Drive URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive URL</label>
          <input
            type="url"
            className="border p-2 w-full rounded-md"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="Enter Google Drive Link"
          />
        </div>

        {/* Subject Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
          title='selectSub'
            className="border p-2 w-full rounded-md"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {subjects.map((subject: any) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
          Add eBook
        </button>
      </form>
    </div>
  );
};

export default ManageEBooks;
