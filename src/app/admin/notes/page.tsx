"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageNotes = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subjects, setSubjects] = useState([]); // Stores fetched subjects
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState([]); // Stores topics based on selected subject
  const [selectedTopic, setSelectedTopic] = useState('');

  // Fetch subjects from the API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/subjects`);
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch topics based on the selected subject
  useEffect(() => {
    if (selectedSubject) {
      const fetchTopics = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/topics?subject=${selectedSubject}`);
          setTopics(response.data);
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      };
      fetchTopics();
    }
  }, [selectedSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const noteData = { title, url, subject: selectedSubject, topic: selectedTopic };

    try {
      await axios.post('/api/notes', noteData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setTitle('');
      setUrl('');
      setSelectedSubject('');
      setSelectedTopic('');
      alert('Note uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Error uploading note.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Upload Notes</h1>
      <form onSubmit={handleSubmit}>
        {/* Note Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Note Title</label>
          <input
          title='text'
            type="text"
            className="border p-2 w-full rounded-md text-black"
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
            className="border p-2 w-full rounded-md text-black"
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
          title='SelectedSub'
            className="border p-2 w-full rounded-md text-black"
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

        {/* Topic Selection */}
        {selectedSubject && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select
            title='selectedTopic'
              className="border p-2 w-full rounded-md text-black"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              required
            >
              <option value="">Select a topic</option>
              {topics.map((topic: any) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
          Upload Note
        </button>
      </form>
    </div>
  );
};

export default ManageNotes;
