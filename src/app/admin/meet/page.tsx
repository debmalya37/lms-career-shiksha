'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
}

interface MeetLink {
  _id: string;
  title: string;
  thumbnail?: string;
  link: string;
  courseIds: string[];
  createdAt: string;
}

export default function AdminMeetLinkPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meetLinks, setMeetLinks] = useState<MeetLink[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  // Fetch courses and existing meet links
  useEffect(() => {
    axios.get('/api/course')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));

    fetchMeetLinks();
  }, []);

  const fetchMeetLinks = () => {
    axios.get('/api/meetlinks')
      .then(res => setMeetLinks(res.data))
      .catch(err => console.error("Error fetching meet links", err));
  };

  const handleCheckbox = (id: string) => {
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!title || !link || selectedCourses.length === 0) {
      alert("All fields required.");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("link", link);
    selectedCourses.forEach(cid => formData.append("courseIds", cid));
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
  
    await axios.post('/api/meetlinks/create', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  
    alert("Meet link added!");
    setTitle('');
    setLink('');
    setSelectedCourses([]);
    setThumbnailFile(null);
    fetchMeetLinks();
  };
  

  const handleDelete = async (id: string) => {
    if (confirm("Delete this meet link?")) {
      await axios.delete(`/api/meetlinks/${id}`);
      fetchMeetLinks();
    }
  };

  const getCourseTitles = (ids: string[]) =>
    ids.map(id => courses.find(c => c._id === id)?.title).filter(Boolean).join(', ');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create Google Meet Link</h2>

      <input
        type="text"
        placeholder="Session Title"
        className="border p-2 mb-2 w-full"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
    
<input
title='thumbnail'
  type="file"
  accept="image/*"
  className="border p-2 mb-2 w-full"
  onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
/>
      <input
        type="text"
        placeholder="https://meet.google.com/xxx-xxxx-xxx"
        className="border p-2 mb-2 w-full"
        value={link}
        onChange={e => setLink(e.target.value)}
      />

      <h3 className="font-medium mb-2">Select Courses</h3>
      <div className="mb-4 max-h-40 overflow-y-auto border p-2 rounded">
        {courses.map(course => (
          <label key={course._id} className="block">
            <input
              type="checkbox"
              checked={selectedCourses.includes(course._id)}
              onChange={() => handleCheckbox(course._id)}
              className="mr-2"
            />
            {course.title}
          </label>
        ))}
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-8"
        onClick={handleSubmit}
      >
        Submit
      </button>

      <h2 className="text-xl font-semibold mb-4">Existing Meet Links</h2>
      {meetLinks.length === 0 ? (
        <p className="text-gray-500">No meet links created yet.</p>
      ) : (
        <ul className="space-y-4">
          {meetLinks.map(link => (
            <li key={link._id} className="border rounded p-4 shadow bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{link.title}</h3>
                  <p className="text-sm text-blue-600 underline break-all">{link.link}</p>
                  {link.thumbnail && (
  <img src={link.thumbnail} alt="Thumbnail" className="mt-2 w-full h-40 object-cover rounded" />
)}

                  <p className="text-sm text-gray-600 mt-1">
                    Courses: {getCourseTitles(link.courseIds)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(link._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
