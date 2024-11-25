"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
}

const ManageLiveClasses = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`https://civilacademyapp.com/api/course`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`https://civilacademyapp.com/api/live-classes`, { title, url, course: selectedCourse });
      setTitle('');
      setUrl('');
      setSelectedCourse('');
      alert('Live stream added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding live stream.');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Live Class Stream</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Stream Title</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Stream URL</label>
          <input
          title='url'
            type="text"
            className="border p-2 w-full rounded-md"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
          title='selectcourse'
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border p-2 w-full rounded-md"
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Live Stream
        </button>
      </form>
    </div>
  );
};

export default ManageLiveClasses;
