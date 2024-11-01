"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageTopics = () => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topicName, setTopicName] = useState('');

  // Fetch subjects for the dropdown selection
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('/api/subjects');
        setSubjects(res.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch topics based on selected subject
  useEffect(() => {
    const fetchTopics = async () => {
      if (selectedSubject) {
        try {
          const res = await axios.get(`/api/topics?subject=${selectedSubject}`);
          setTopics(res.data);
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      }
    };
    fetchTopics();
  }, [selectedSubject]);

  // Handle form submission to add a new topic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('/api/topics', { name: topicName, subject: selectedSubject });
      setTopicName(''); // Clear the input
      alert('Topic added successfully!');
      setTopics(prevTopics => [...prevTopics, { name: topicName }]); // Update UI with new topic
    } catch (error) {
      console.error('Error adding topic:', error);
      alert('Failed to add topic.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Manage Topics</h1>

      {/* Subject Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
        <select
          title="selectSubject"
          className="border p-2 w-full rounded-md"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          required
        >
          <option value="">Choose a subject</option>
          {subjects.map((subject: any) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Topic List */}
      {selectedSubject && topics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Topics under {subjects.find((s: any) => s._id === selectedSubject)?.name}</h2>
          <ul className="list-disc pl-5">
            {topics.map((topic: any) => (
              <li key={topic._id}>{topic.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Add New Topic Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">New Topic Name</label>
          <input
            title="newTopicName"
            type="text"
            className="border p-2 w-full rounded-md"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            required
            placeholder="Enter topic name"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          disabled={!selectedSubject}
        >
          Add Topic
        </button>
      </form>
    </div>
  );
};

export default ManageTopics;
