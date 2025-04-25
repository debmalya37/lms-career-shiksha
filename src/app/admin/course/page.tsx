"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { XCircleIcon } from "lucide-react";

interface Subject {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  courseImg: string;
  subjects: Subject[];
  isHidden: boolean;
  /** New fields: */
  price: number;
  isFree: boolean;
}

const ManageCourses = () => {
  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [subject, setSubject]           = useState("");
  const [subjects, setSubjects]         = useState<Subject[]>([]);
  const [topic, setTopic]               = useState("");
  const [topics, setTopics]             = useState<Topic[]>([]);
  const [courseImg, setCourseImg]       = useState<File | null>(null);

  const [courses, setCourses]           = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isHidden, setIsHidden]         = useState(false);
  /** New state for price/isFree */
  const [price, setPrice]               = useState(0);
  const [isFree, setIsFree]             = useState(false);

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get<Course[]>("/api/course");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  }, []);
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch subjects
  useEffect(() => {
    axios.get<Subject[]>("/api/subjects")
      .then(res => setSubjects(res.data))
      .catch(err => console.error("Error fetching subjects:", err));
  }, []);

  // Fetch topics when subject changes
  useEffect(() => {
    if (!subject) return;
    axios.get<Topic[]>(`/api/topics?subject=${subject}`)
      .then(res => setTopics(res.data))
      .catch(err => console.error("Error fetching topics:", err));
  }, [subject]);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSubject("");
    setTopic("");
    setCourseImg(null);
    setIsHidden(false);
    setPrice(0);
    setIsFree(false);
    setEditingCourse(null);
  };

  // Pre-fill form when editing
  const handleEditClick = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setDescription(c.description);
    setSubject(c.subjects[0]?._id || "");
    setIsHidden(c.isHidden);
    setPrice(c.price);
    setIsFree(c.isFree);
    setCourseImg(null);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (editingCourse) {
      formData.append("id", editingCourse._id);
    }
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subjects", JSON.stringify([
      ...(editingCourse?.subjects.map(s => s._id) || []),
      ...(subject ? [subject] : [])
    ]));
    formData.append("isHidden", String(isHidden));
    /** Append new fields: */
    formData.append("isFree", String(isFree));
    formData.append("price", String(price));

    if (courseImg) {
      formData.append("courseImg", courseImg);
    }

    try {
      await axios.post("/api/course", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(editingCourse ? "Course updated!" : "Course created!");
      resetForm();
      fetchCourses();
    } catch (err) {
      console.error("Error adding/updating course:", err);
      alert("Failed to save course.");
    }
  };

   // Remove a subject from the course
   const handleRemoveSubject = (subjectId: string) => {
    if (!editingCourse) return;
  
    const updatedSubjects = editingCourse.subjects.filter((subj) => subj._id !== subjectId);
    setEditingCourse({ ...editingCourse, subjects: updatedSubjects });
  };

  // Delete handler
  
  const handleDelete = async (courseId: string) => {
    if (!confirm("Delete this course?")) return;
    try {
      await axios.delete(`/api/course/delete?id=${courseId}`);
      alert("Deleted!");
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Could not delete.");
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">
        {editingCourse ? "Edit Course" : "Add Course"}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Course Title</label>
          <input
          title="Enter course title"
            placeholder="Enter course title"
            type="text"
            className="border p-2 w-full rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="border p-2 w-full rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter course description"
            required
          />
        </div>

        {/* Thumbnail */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Course Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setCourseImg(e.target.files?.[0] || null)}
            placeholder="Upload course thumbnail"
            title="Upload course thumbnail"
          />
          {editingCourse && editingCourse.courseImg && (
            <p className="text-sm text-gray-600 mt-1">
              Current: {editingCourse.courseImg}
            </p>
          )}
        </div>

        {/* Subject select */}
        {editingCourse && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">Subjects in this Course</h2>
            <ul className="space-y-2">
              {editingCourse.subjects.map((subj) => (
                <li key={subj._id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                  <span>{subj.name}</span>
                  <button
                  title="removeSubject"
                    type="button"
                    onClick={() => handleRemoveSubject(subj._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mb-4">
          {/* <label className="block text-sm font-medium mb-1">Subject</label> */}
          <label htmlFor="subject-select" className="block text-sm font-medium mb-1">Subject</label>
          <select
            id="subject-select"
            className="border p-2 w-full rounded"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Topic select */}
        {subject && (
          <div className="mb-4">
            {/* <label className="block text-sm font-medium mb-1">Topic</label> */}
            <label htmlFor="topic-select" className="block text-sm font-medium mb-1">Topic</label>
            <select
              id="topic-select"
              className="border p-2 w-full rounded"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            >
              <option value="">Select a topic</option>
              {topics.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* isHidden */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isHidden}
              onChange={e => setIsHidden(e.target.checked)}
              className="mr-2"
            />
            Hide this course
          </label>
        </div>

        {/* isFree */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isFree}
              onChange={e => setIsFree(e.target.checked)}
              className="mr-2"
            />
            Mark as Free
          </label>
        </div>

        {/* Price (disabled if isFree) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Price (₹)</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            min={0}
            disabled={isFree}
            required={!isFree}
            title="Enter the course price"
            placeholder="Enter price in ₹"
          />
        </div>

        {/* Submit / Cancel */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
        >
          {editingCourse ? "Update Course" : "Add Course"}
        </button>
        {editingCourse && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Existing Courses */}
      <h2 className="mt-8 text-xl font-semibold">Existing Courses</h2>
      <ul className="space-y-4 mt-4">
        {courses.map(c => (
          <li
            key={c._id}
            className="p-4 bg-gray-100 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.description}</p>
              <p className="text-sm">
                  {c.isFree
                    ? "Free"
                    : c.price != null
                      ? `₹${c.price.toFixed(0)}`
                      : "N/A"}
                </p>

              <p className="text-sm text-gray-600">
                Hidden: {c.isHidden ? "Yes" : "No"}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditClick(c)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageCourses;
