"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminTestSeriesPage() {
  const [title, setTitle] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [course, setCourse] = useState('');
  const [subject, setSubject] = useState('');
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/api/course`);
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch subjects when course is selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (course) {
        try {
          const response = await axios.get(`/api/subjects?course=${course}`);
          setSubjects(response.data);
        } catch (error) {
          console.error('Failed to fetch subjects:', error);
        }
      }
    };
    fetchSubjects();
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/api/test-series`, {
        title,
        googleFormLink,
        course,
        subject
      });
      setTitle('');
      setGoogleFormLink('');
      setCourse('');
      setSubject('');
      alert('Test series added successfully!');
    } catch (error) {
      console.error('Error adding test series:', error);
      alert('Error adding test series.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Test Series</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
          title="text"
            type="text"
            className="border p-2 w-full rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Form Link</label>
          <input
          title="text"
            type="url"
            className="border p-2 w-full rounded-md"
            value={googleFormLink}
            onChange={(e) => setGoogleFormLink(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
          <select
          title="text"
            className="border p-2 w-full rounded-md"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          >
            <option value="">Select a course</option>
            {courses.map((course:any) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
          title="text"
            className="border p-2 w-full rounded-md"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {subjects.map((subject:any) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Test Series
        </button>
      </form>
    </div>
  );
}
