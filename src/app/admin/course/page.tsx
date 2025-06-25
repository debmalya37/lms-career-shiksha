"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { XCircleIcon } from "lucide-react";
import Sidebar from "@/components/AdminSideBar";

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
  price: number;
  isFree: boolean;
  discountedPrice: number;   // <-- new
  introVideo: string;
}

const ManageCourses = () => {
  // form state
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject]         = useState("");
  const [subjects, setSubjects]       = useState<Subject[]>([]);
  const [topic, setTopic]             = useState("");
  const [topics, setTopics]           = useState<Topic[]>([]);
  const [courseImg, setCourseImg]     = useState<File | null>(null);
  const [isHidden, setIsHidden]       = useState(false);
  const [price, setPrice]             = useState(0);
  const [isFree, setIsFree]           = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(0); // <-- new
  const [introVideo, setIntroVideo] = useState("");
  const [introError, setIntroError] = useState<string | null>(null);
  const [days, setDays]     = useState(0);
const [months, setMonths] = useState(0);
const [years, setYears]   = useState(20);
const [duration, setDuration] = useState(days + months*30 + years*365);

function updateDuration(d: number, m: number, y: number) {
  setDays(d);
  setMonths(m);
  setYears(y);
  setDuration(d + m * 30 + y * 365);
}


  // courses list + editing
  const [courses, setCourses]           = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get<Course[]>("/api/course");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);
  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    axios.get<Subject[]>("/api/subjects").then(r => setSubjects(r.data));
  }, []);

  function isValidYouTubeUrl(url: string): boolean {
    const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&].*)?$/;
    return ytRegex.test(url.trim());
  }
  
  
  useEffect(() => {
    if (!subject) return;
    axios.get<Topic[]>(`/api/topics?subject=${subject}`).then(r => setTopics(r.data));
  }, [subject]);


  const resetForm = () => {
    setTitle(""); setDescription(""); setSubject(""); setTopic("");
    setCourseImg(null); setIsHidden(false);
    setPrice(0); setIsFree(false); setDiscountedPrice(0);
    setEditingCourse(null);
  };

  const handleEditClick = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setDescription(c.description);
    setSubject(c.subjects[0]?._id || "");
    setIsHidden(c.isHidden);
    setPrice(c.price);
    setIsFree(c.isFree);
    setDiscountedPrice(c.discountedPrice);  // <-- new
    setCourseImg(null);
    setIntroVideo(c.introVideo || ""); // <-- NEW

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (editingCourse) formData.append("id", editingCourse._id);

    formData.append("title", title);
    formData.append("description", description);
    formData.append("subjects", JSON.stringify([
      ...(editingCourse?.subjects.map(s => s._id) || []),
      ...(subject ? [subject] : [])
    ]));
    formData.append("isHidden", String(isHidden));
    formData.append("introVideo", introVideo);
    formData.append("duration", String(duration));

    formData.append("isFree", String(isFree));
    formData.append("price", String(price));
    formData.append("discountedPrice", String(discountedPrice)); // <-- new

    if (courseImg) formData.append("courseImg", courseImg);

    try {
      await axios.post("/api/course", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(editingCourse ? "Course updated!" : "Course created!");
      resetForm();
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to save course.");
    }
  };

  const handleRemoveSubject = (id: string) => {
    if (!editingCourse) return;
    setEditingCourse({
      ...editingCourse,
      subjects: editingCourse.subjects.filter(s => s._id !== id)
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    try {
      await axios.delete(`/api/course/delete?id=${id}`);
      setCourses(courses.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete.");
    }
  };

  return (
   
    <div className="p-8 bg-white rounded-lg shadow-md max-w-5xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">
        {editingCourse ? "Edit Course" : "Add Course"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Course Title</label>
          <input
          title="Enter course title"
            type="text"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="mt-1 block w-full border rounded px-3 py-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter course description"
            required
          />
        </div>

        {/* Intro Video Link */}
<div>
  <label className="block text-sm font-medium">Intro Video (YouTube URL)</label>
  <input
    type="url"
    placeholder="https://youtu.be/VIDEO_ID"
    className={`mt-1 block w-full border rounded px-3 py-2 
      ${introError ? 'border-red-500' : ''}`}
    value={introVideo}
    onChange={e => {
      const v = e.target.value;
      setIntroVideo(v);
      // validate as they type
      if (!v) {
        setIntroError("URL is required");
      } else if (!isValidYouTubeUrl(v)) {
        setIntroError("Not a valid YouTube link");
      } else {
        setIntroError(null);
      }
    }}
    
  />
  {introError && (
    <p className="mt-1 text-sm text-red-600">{introError}</p>
  )}
</div>


        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1"
            placeholder="Upload course thumbnail"
            title="Upload course thumbnail"
            onChange={e => setCourseImg(e.target.files?.[0] || null)}
          />
          {editingCourse?.courseImg && (
            <p className="text-xs text-gray-500 mt-1">Current: {editingCourse.courseImg}</p>
          )}
        </div>

        {/* Subjects */}
        {editingCourse && (
          <div>
            <h2 className="font-medium">Existing Subjects</h2>
            <ul className="mt-1 space-y-1">
              {editingCourse.subjects.map(s => (
                <li key={s._id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  {s.name}
                  <button type="button" onClick={() => handleRemoveSubject(s._id)} title="Remove subject">
                    <XCircleIcon className="w-5 h-5 text-red-500"/>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Add Subject</label>
          <select
            title="Select a subject"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          >
            <option value="">Select subject</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
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
              title="Hide this course"
              placeholder="Check to hide this course"
            />
            Hide this course
          </label>
        </div>

        <div>
    <label className="block text-sm font-medium">Course Duration ( days - months - year )</label>
    <div className="grid grid-cols-3 gap-4 mt-1">
      <div>
        <input
          type="number"
          min={0}
          value={days}
          onChange={e => updateDuration(+e.target.value, months, years)}
          className="w-full border rounded px-2 py-1"
          placeholder="Days"
          required
        />
      </div>
      <div>
        <input
          type="number"
          min={0}
          value={months}
          onChange={e => updateDuration(days, +e.target.value, years)}
          className="w-full border rounded px-2 py-1"
          placeholder="Months"
          required
        />
      </div>
      <div>
        <input
          type="number"
          min={0}
          value={years}
          onChange={e => updateDuration(days, months, +e.target.value)}
          className="w-full border rounded px-2 py-1"
          placeholder="Years"
          required
        />
      </div>
    </div>
  </div>


        {/* Free */}

        <div className="flex items-center">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isFree}
            onChange={e => setIsFree(e.target.checked)}
            className="mr-2"
          />
          Mark as Free</label>
        </div>

        {/* Price & Discounted Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Price (₹)</label>
            <input
              type="number"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              disabled={isFree}
              required={!isFree}
              title="Enter the course price"
            placeholder="Enter price in ₹"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Discounted Price (₹)</label>
            <input
            title="Enter the discounted price"
              placeholder="Enter discounted price in ₹"
              type="number"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={discountedPrice}
              onChange={e => setDiscountedPrice(Number(e.target.value))}
              disabled={isFree}
              required={!isFree}
            />
          </div>
        </div>

        <div>
        <button
  type="submit"
  className={`px-4 py-2 rounded ${
    introError ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  } text-white`}
  disabled={!!introError}
>
  {editingCourse ? "Update Course" : "Add Course"}
</button>

          {editingCourse && (
            <button
              type="button"
              onClick={resetForm}
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="mt-8 text-xl font-semibold">Existing Courses</h2>
      <ul className="space-y-4 mt-4">
        {courses.map(c => (
          <li
            key={c._id}
            className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.description}</p>
              <p className="mt-1">
                {c.isFree
                  ? "Free"
                  : <>
                      <span className="line-through text-gray-500">₹{(c.price ?? 0).toFixed(0)}</span>
                      <span className="text-green-600 ml-2">₹{(c.discountedPrice ?? 0).toFixed(0)}</span>
                    </>}
              </p>
              <p className="text-xs text-gray-500">
                Hidden: {c.isHidden ? "Yes" : "No"}
              </p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEditClick(c)} className="bg-green-500 text-white px-3 py-1 rounded" title="Edit course">Edit</button>
              <button onClick={() => handleDelete(c._id)} className="bg-red-500 text-white px-3 py-1 rounded" title="Delete course">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
    
  );
};

export default ManageCourses;
