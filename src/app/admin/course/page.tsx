"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

const ManageCourses = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  // Fetch subjects from the API
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

  // Fetch topics when subject is selected
  useEffect(() => {
    const fetchTopics = async () => {
      if (subject) {
        try {
          const res = await axios.get(`/api/topics?subject=${subject}`);
          setTopics(res.data);
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      }
    };
    fetchTopics();
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const courseData = { title, description, url, subject, topic };

    try {
      await axios.post('/api/course', courseData);
      setTitle('');
      setDescription('');
      setUrl('');
      setSubject('');
      setTopic('');
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Error adding course.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Add Course</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            title='description'
            className="border p-2 w-full rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
          <input
            type="url"
            className="border p-2 w-full rounded-md"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="Enter YouTube embed link"
          />
        </div>

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
            {subjects.map((subj: any) => (
              <option key={subj._id} value={subj._id}>{subj.name}</option>
            ))}
          </select>
        </div>

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
              {topics.map((top: any) => (
                <option key={top._id} value={top._id}>{top.name}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Course
        </button>
      </form>
    </div>
  );
};

export default ManageCourses;
