"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface Course {
  _id: string;
  title: string;
}

interface LiveClass {
  _id: string;
  title: string;
  url: string;
  courses: string[]; // Array of course IDs
}

const ManageLiveClasses = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/api/course`);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch live classes
  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        const response = await axios.get(`/api/live-classes`);
        setLiveClasses(response.data);
      } catch (error) {
        console.error("Error fetching live classes:", error);
      }
    };

    fetchLiveClasses();
  }, []);

  // Handle form submission to add live class under selected courses
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCourses.length === 0) {
      alert("Please select at least one course.");
      return;
    }

    try {
      await axios.post(`/api/live-classes`, {
        title,
        url,
        courses: selectedCourses, // Send selected course IDs
      });
      setTitle("");
      setUrl("");
      setSelectedCourses([]);
      alert("Live stream added successfully!");
    } catch (error) {
      console.error("Error adding live class:", error);
      alert("Error adding live stream.");
    }
  };

  // Handle delete button click
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this live class?")) {
      try {
        await axios.delete(`/api/live-classes?id=${id}`);
        alert("Live class deleted successfully!");
        setLiveClasses((prev) => prev.filter((liveClass) => liveClass._id !== id));
      } catch (error) {
        console.error("Error deleting live class:", error);
        alert("Failed to delete live class.");
      }
    }
  };

  // Handle checkbox toggle for course selection
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId) // Remove if already selected
        : [...prev, courseId] // Add if not selected
    );
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Live Class Stream</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Stream Title</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Stream URL</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Courses</label>
          <div className="grid grid-cols-2 gap-2">
            {courses.map((course) => (
              <div key={course._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={course._id}
                  checked={selectedCourses.includes(course._id)}
                  onChange={() => toggleCourseSelection(course._id)}
                  className="mr-2"
                />
                <label htmlFor={course._id} className="text-sm font-medium">
                  {course.title}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Add Live Stream
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Existing Live Classes</h2>
        <ul className="space-y-4">
          {liveClasses.map((liveClass) => (
            <li key={liveClass._id} className="p-4 bg-gray-100 rounded-md shadow">
              <h3 className="font-bold">{liveClass.title}</h3>
              <p className="text-sm text-gray-600">URL: {liveClass.url}</p>
              <p className="text-sm text-gray-600">
                Courses:{" "}
                {Array.isArray(liveClass.courses) &&
                  liveClass.courses
                    .map((courseId) => courses.find((course) => course._id === courseId)?.title)
                    .filter(Boolean)
                    .join(", ")}
              </p>

              <button
                onClick={() => handleDelete(liveClass._id)}
                className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 mt-2"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageLiveClasses;
