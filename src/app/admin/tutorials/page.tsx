"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the Course type
interface Course {
  _id: string;
  title: string;
}

// Define the Subject type
interface Subject {
  _id: string;
  name: string;
}

// Define the Topic type
interface Topic {
  _id: string;
  name: string;
}

const ManageTutorials = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [courses, setCourses] = useState<Course[]>([]); // Explicitly set type
  const [selectedCourse, setSelectedCourse] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]); // Explicitly set type
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]); // Explicitly set type
  const [selectedTopic, setSelectedTopic] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/course/admin');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch subjects based on selected course
  useEffect(() => {
    if (selectedCourse) {
      const fetchSubjects = async () => {
        try {
          const response = await axios.get(`https://civilacademyapp.com/api/subjects?course=${selectedCourse}`);
          setSubjects(response.data);
        } catch (error) {
          console.error('Error fetching subjects:', error);
        }
      };
      fetchSubjects();
    }
  }, [selectedCourse]);

  // Fetch topics based on selected subject
  useEffect(() => {
    if (selectedSubject) {
      const fetchTopics = async () => {
        try {
          const response = await axios.get(`/api/topics?subject=${selectedSubject}`);
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
    try {
      await axios.post('/api/tutorials', {
        title,
        url,
        description,
        subject: selectedSubject,
        topic: selectedTopic,
      });
      setTitle('');
      setUrl('');
      setDescription('');
      setSelectedCourse('');
      setSelectedSubject('');
      setSelectedTopic('');
      alert('Tutorial video added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding tutorial video.');
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName || !selectedCourse) {
      alert("Please enter a subject name and select a course.");
      return;
    }
    try {
      const response = await axios.post(`https://civilacademyapp.com/api/subjects`, {
        name: newSubjectName,
        course: selectedCourse,
      });
      setSubjects((prevSubjects) => [...prevSubjects, response.data]);
      setNewSubjectName('');
      alert('New subject added successfully!');
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject.');
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName || !selectedSubject) {
      alert("Please enter a topic name and select a subject.");
      return;
    }
    try {
      const response = await axios.post('/api/topics', {
        name: newTopicName,
        subject: selectedSubject,
      });
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
      <h1 className="text-2xl font-bold mb-4">Add Tutorial Video</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
          <input
            title="title"
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
            title="description"
            className="border p-2 w-full rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (YouTube Embed)</label>
          <input
            title="url"
            type="text"
            className="border p-2 w-full rounded-md"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
          <select
            title="selectCourse"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
            title="selectSubject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <select
            title="selectTopic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            required
          >
            <option value="">Select Topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>{topic.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Tutorial Video
        </button>
      </form>

      {/* Add New Subject Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Add New Subject</h2>
        <input
          type="text"
          className="border p-2 w-full rounded-md"
          placeholder="Enter new subject name"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
        />
        <button
          onClick={handleAddSubject}
          className="mt-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Add Subject
        </button>
      </div>

      {/* Add New Topic Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Add New Topic</h2>
        <input
          type="text"
          className="border p-2 w-full rounded-md"
          placeholder="Enter new topic name"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
        />
        <button
          onClick={handleAddTopic}
          className="mt-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Add Topic
        </button>
      </div>
    </div>
  );
};

export default ManageTutorials;
