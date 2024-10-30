"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Subject {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
}

const ManageCourses = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  // Fetch subjects from the existing subjects API
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

  // Fetch topics when a subject is selected
  useEffect(() => {
    if (subject) {
      const fetchTopics = async () => {
        try {
          const res = await axios.get(`/api/topics?subject=${subject}`);
          setTopics(res.data);
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      };
      fetchTopics();
    }
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const courseData = { title, description, subjects: [subject] };

    try {
      await axios.post('/api/course', courseData);
      setTitle('');
      setDescription('');
      setSubject('');
      setTopic('');
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Error adding course.');
    }
  };

  // Handle adding a new subject with `api/newSubject`
  const handleAddSubject = async () => {
    if (!newSubjectName) {
      alert("Please enter a subject name.");
      return;
    }

    try {
      const response = await axios.post('/api/newSubject', { name: newSubjectName });
      setSubjects((prevSubjects) => [...prevSubjects, response.data.data]);
      setNewSubjectName('');
      alert('New subject added successfully!');
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject.');
    }
  };

  // Handle adding a new topic
  const handleAddTopic = async () => {
    if (!newTopicName || !subject) {
      alert("Please select a subject and enter a topic name.");
      return;
    }

    try {
      const response = await axios.post('/api/topics', { name: newTopicName, subject });
      setTopics((prevTopics) => [...prevTopics, response.data]);
      setNewTopicName('');
      alert('New topic added successfully!');
    } catch (error) {
      console.error('Error adding topic:', error);
      alert('Failed to add topic.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Add Course</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
          <input
          title='text'
            type="text"
            className="border p-2 w-full rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
          title='desc'
            className="border p-2 w-full rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Subject Selection */}
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
              <option key={subj._id} value={subj._id}>{subj.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddSubject}
            className="mt-2 text-blue-600 underline text-sm"
          >
            Add New Subject
          </button>
        </div>

        {/* Topic Selection */}
        {subject && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select
            title='topic'
              className="border p-2 w-full rounded-md"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            >
              <option value="">Select a topic</option>
              {topics.map((top) => (
                <option key={top._id} value={top._id}>{top.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddTopic}
              className="mt-2 text-blue-600 underline text-sm"
            >
              Add New Topic
            </button>
          </div>
        )}

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Course
        </button>
      </form>

      {/* Add New Subject Modal */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Add New Subject</h2>
        <input
          type="text"
          className="border p-2 w-full rounded-md"
          placeholder="Enter new subject name"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
        />
        <button
          onClick={handleAddSubject}
          className="mt-2 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          Add Subject
        </button>
      </div>

      {/* Add New Topic Modal */}
      {subject && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Add New Topic</h2>
          <input
            type="text"
            className="border p-2 w-full rounded-md"
            placeholder="Enter new topic name"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
          />
          <button
            onClick={handleAddTopic}
            className="mt-2 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            Add Topic
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
