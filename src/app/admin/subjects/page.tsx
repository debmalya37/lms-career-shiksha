"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface Subject {
  _id: string;
  name: string;
  course: string | string[]; // Course can be a single string or an array
  subjectImg?: string;
}

interface Course {
  _id: string;
  title: string;
}

const ManageSubjects = () => {
  const [subjectName, setSubjectName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]); // Define course type
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectImg, setSubjectImg] = useState<File | null>(null);


  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectRes, courseRes] = await Promise.all([
          axios.get(`https://civilacademyapp.com/api/subjects`),
          axios.get(`https://civilacademyapp.com/api/course`),
        ]);
        setSubjects(subjectRes.data);
        setCourses(courseRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('name', subjectName);
    selectedCourses.forEach((course) => formData.append('courses', course));
    if (subjectImg) {
      formData.append('subjectImg', subjectImg);
    }
  
    try {
      if (editingSubject) {
        formData.append('id', editingSubject._id); // For editing
        await axios.post(`https://civilacademyapp.com/api/subjects/edit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Subject updated successfully!');
      } else {
        await axios.post(`https://civilacademyapp.com/api/subjects`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Subject added successfully!');
      }
  
      // Refresh subjects
      const res = await axios.get(`https://civilacademyapp.com/api/subjects`);
      setSubjects(res.data);
      resetForm();
    } catch (error) {
      console.error('Error adding/updating subject:', error);
      alert('Failed to add/update subject.');
    }
  };
  
  // Delete a subject
  const handleDelete = async (subjectId: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await axios.delete(`https://civilacademyapp.com/api/subjects/delete?id=${subjectId}`);
        alert("Subject deleted successfully!");

        // Refresh the subject list
        setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject._id !== subjectId));
      } catch (error) {
        console.error("Error deleting subject:", error);
        alert("Failed to delete subject.");
      }
    }
  };

  // Reset form to default state
  const resetForm = () => {
    setSubjectName('');
    setSelectedCourses([]);
    setSubjectImg(null);
    setEditingSubject(null);
  };
  

  // Handle subject edit
  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setSelectedCourses(
      Array.isArray(subject.course) ? subject.course : [subject.course]
    );
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">{editingSubject ? "Edit Subject" : "Add Subject"}</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
          <input
          title="sub"
            type="text"
            className="border p-2 w-full rounded-md"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
        </div>
        

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Courses</label>
          <select
          title="couse"
            multiple
            className="border p-2 w-full rounded-md"
            value={selectedCourses}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
              setSelectedCourses(selectedOptions);
            }}
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Image</label>
          <input
            title="subjectImg"
            type="file"
            accept="image/*"
            onChange={(e) => setSubjectImg(e.target.files?.[0] || null)}
          />
          {editingSubject && editingSubject.subjectImg && (
            <img
              src={editingSubject.subjectImg}
              alt="Subject Thumbnail"
              className="w-20 h-20 mt-2 rounded-md"
            />
          )}
        </div>

        <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
          {editingSubject ? "Update Subject" : "Add Subject"}
        </button>
        {editingSubject && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 ml-4"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Subject List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Existing Subjects</h2>
        <ul className="space-y-4">
          {subjects.map((subject) => (
            <li key={subject._id} className="p-4 bg-gray-100 rounded-md shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold">{subject.name}</h3>
              </div>
              <button
                onClick={() => handleEdit(subject)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Edit
              </button>
              <button
                  onClick={() => handleDelete(subject._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
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

export default ManageSubjects;



      {/* Form for Adding a New Topic to a Selected Subject */}
      {/* <form onSubmit={handleTopicSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
          <select
            title='selectedSubject'
            className="border p-2 w-full rounded-md"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {topics.map((subject: any) => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Topic to Selected Subject</label>
          <input
            title='newTopic'
            type="text"
            className="border p-2 w-full rounded-md"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
          Add Topic
        </button>
      </form> */}
//     </div>
//   );
// };

// export default ManageSubjects;
