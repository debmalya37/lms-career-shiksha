"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageEBooks = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [ebookImg, setEbookImg] = useState<File | null>(null); // New state for the image file
  const [subjects, setSubjects] = useState([]); 
  const [selectedSubject, setSelectedSubject] = useState(''); 

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`https://civilacademyapp.com/api/subjects`);
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('url', url);
    formData.append('subject', selectedSubject);
    if (ebookImg) {
      formData.append('ebookImg', ebookImg); // Append the image file
    }

    try {
      await axios.post(`https://civilacademyapp.com/api/ebook`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTitle('');
      setUrl('');
      setSelectedSubject('');
      setEbookImg(null);
      alert('eBook added successfully!');
    } catch (error) {
      console.error('Error adding eBook:', error);
      alert('Error adding eBook.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Add eBook</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* eBook Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">eBook Title</label>
          <input
          title='title'
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

        {/* eBook Thumbnail */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">eBook Thumbnail</label>
          <input
          title='img'
            type="file"
            accept="image/*"
            onChange={(e) => setEbookImg(e.target.files?.[0] || null)}
            required
          />
        </div>

        {/* Subject Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
          title='selectedSub'
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
