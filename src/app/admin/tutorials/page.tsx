"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

// Define types for your data
interface Course {
  _id: string;
  title: string;
}

interface Subject {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
}

const ManageTutorials = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/course');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    if (courses.length === 0) {
      fetchCourses();
    }
  }, [courses]);

  // Fetch subjects based on selected course
  useEffect(() => {
    if (selectedCourse) {
      const fetchSubjects = async () => {
        try {
          const response = await axios.get(`/api/subjects?course=${selectedCourse}`);
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
        course: selectedCourse,
        subject: selectedSubject,
        topic: selectedTopic,
      });
      // Clear form
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
      const response = await axios.post('/api/subjects', {
        name: newSubjectName,
        course: selectedCourse, // Link the subject to the selected course
      });
      setSubjects((prevSubjects) => [...prevSubjects, response.data]);
      setNewSubjectName(''); // Clear input
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
        subjectId: selectedSubject, // Link the topic to the selected subject
      });
      setTopics((prevTopics) => [...prevTopics, response.data]);
      setNewTopicName(''); // Clear input
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
            title="selectSub"
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

      {/* Form for adding a new subject */}
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

      {/* Form for adding a new topic */}
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
