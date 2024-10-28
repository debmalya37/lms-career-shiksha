"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageSubjects = () => {
  const [subjectName, setSubjectName] = useState('');
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    // Fetch existing subjects to populate dropdown
    async function fetchSubjects() {
      try {
        const res = await axios.get('/api/subjects');
        setTopics(res.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }

    fetchSubjects();
  }, []);

  // Submit new subject
  const handleSubjectSubmit = async (e: React.FormEvent) => {
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

  // Submit new topic
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !newTopic) {
      alert('Please select a subject and enter a topic name');
      return;
    }

    try {
      await axios.post('/api/topics', { name: newTopic, subjectId: selectedSubject });
      setNewTopic('');
      alert('Topic added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding topic.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Manage Subjects and Topics</h1>

      {/* Form for Adding a New Subject */}
      <form onSubmit={handleSubjectSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add New Subject</label>
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

      {/* Form for Adding a New Topic to a Selected Subject */}
      <form onSubmit={handleTopicSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
          <select
          title='selectedSubject'
            className="border p-2 w-full rounded-md"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {topics.map((subject: any) => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Topic to Selected Subject</label>
          <input
          title='newTopic'
            type="text"
            className="border p-2 w-full rounded-md"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
          Add Topic
        </button>
      </form>
    </div>
  );
};

export default ManageSubjects;
