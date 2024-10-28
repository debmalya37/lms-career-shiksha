"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

const GlobalCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Fetch all courses and subjects from the API
  useEffect(() => {
    const fetchCoursesAndSubjects = async () => {
      try {
        const courseRes = await axios.get('/api/course');
        const subjectRes = await axios.get('/api/subjects');
        setCourses(courseRes.data);
        setFilteredCourses(courseRes.data); // Initialize filtered courses to all courses
        setSubjects(subjectRes.data);
      } catch (error) {
        console.error('Error fetching courses and subjects:', error);
      }
    };

    fetchCoursesAndSubjects();
  }, []);

  // Handle Search and Filtering
  useEffect(() => {
    const filtered = courses.filter((course: any) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.topic.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject
        ? course.subject._id === selectedSubject
        : true;

      return matchesSearch && matchesSubject;
    });

    setFilteredCourses(filtered);
  }, [searchQuery, selectedSubject, courses]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-6">All Courses</h1>

      {/* Search Box */}
      <div className="mb-4 text-black">
        <input
          type="text"
          placeholder="Search courses by title, description, subject, or topic"
          className="border p-2 w-full rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Subject Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
        <select
          title="selectedSubject"
          className="border p-2 w-full rounded-md"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((subject: any) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Courses Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course: any) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-700 mb-4">{course.description}</p>
              <iframe
                title={course.title}
                className="w-full h-48"
                src={`https://www.youtube-nocookie.com/embed/Y6nYrYJQdps?si=UHMrfrmCDrlYR80F?modestbranding=1&rel=0&showinfo=0&controls=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <p className="text-gray-500 mt-2">Subject: {course.subject.name}</p>
              <p className="text-gray-500">Topic: {course.topic.name}</p>
            </div>
          ))
        ) : (
          <p>No courses found.</p>
        )}
      </div>
    </div>
  );
};

export default GlobalCoursesPage;
