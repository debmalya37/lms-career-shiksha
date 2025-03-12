"use client";
import { useEffect, useState } from "react";
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
  isHidden: boolean; // New field
}

const ManageCourses = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [courseImg, setCourseImg] = useState<File | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isHidden, setIsHidden] = useState(false); // State for isHidden

  // Function to fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`/api/course`);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch subjects from the API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`/api/subjects`);
        setSubjects(res.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch topics when a subject is selected
  useEffect(() => {
    if (subject) {
      const fetchTopics = async () => {
        try {
          const res = await axios.get(`/api/topics?subject=${subject}`);
          setTopics(res.data);
        } catch (error) {
          console.error("Error fetching topics:", error);
        }
      };
      fetchTopics();
    }
  }, [subject]);

  // Fetch all courses initially
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle form submission for adding or editing a course
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
  
    // Combine subjects into one array and append as JSON string
    const subjectsArray = [
      ...(editingCourse?.subjects.map((subj) => subj._id) || []),
      ...(subject ? [subject] : []),
    ];
    formData.append("subjects", JSON.stringify(subjectsArray));
  
    formData.append("isHidden", String(isHidden));
  
    if (courseImg) {
      formData.append("courseImg", courseImg);
    }
  
    try {
      if (editingCourse) {
        // Edit existing course
        formData.append("id", editingCourse._id);
        await axios.post(`/api/course/edit`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Course updated successfully!");
      } else {
        // Add a new course
        await axios.post(`/api/course`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Course added successfully!");
      }
  
      // Fetch updated courses after adding/editing
      fetchCourses();
      resetForm();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("Error adding/updating course.");
    }
  };
  
  
  
  
  

  // Handle adding a new subject
const handleAddSubject = async () => {
  if (!newSubjectName) {
    alert("Please enter a subject name.");
    return;
  }

  if (!editingCourse) {
    alert("Please select a course before adding a subject.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", newSubjectName);
    formData.append("courses", editingCourse._id); // Link to the selected course
    if (courseImg) {
      formData.append("subjectImg", courseImg); // Optionally include an image
    }

    await axios.post(`/api/subjects`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Fetch the updated subjects and update the state
    const updatedSubjects = await axios.get(`/api/subjects`);
    setSubjects(updatedSubjects.data);

    setNewSubjectName(""); // Clear the input field
    alert("New subject added successfully!");
  } catch (error) {
    console.error("Error adding subject:", error);
    alert("Failed to add subject.");
  }
};



  // Handle adding a new topic
  const handleAddTopic = async () => {
    if (!newTopicName || !subject) {
      alert("Please select a subject and enter a topic name.");
      return;
    }

    try {
      const response = await axios.post(`/api/topics`, { name: newTopicName, subject });
      setTopics((prevTopics) => [...prevTopics, response.data]);
      setNewTopicName("");
      alert("New topic added successfully!");
    } catch (error) {
      console.error("Error adding topic:", error);
      alert("Failed to add topic.");
    }
  };

  // Remove a subject from the course
  const handleRemoveSubject = (subjectId: string) => {
    if (!editingCourse) return;
  
    const updatedSubjects = editingCourse.subjects.filter((subj) => subj._id !== subjectId);
    setEditingCourse({ ...editingCourse, subjects: updatedSubjects });
  };
  

  // Open the edit form with pre-filled values
  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setSubject(course.subjects?.[0]?._id || "");
    setIsHidden(course.isHidden); // Set the isHidden value
    setCourseImg(null); // Reset file input
  };
  // Handle deleting a course
  const handleDelete = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`/api/course/delete?id=${courseId}`);
        alert("Course deleted successfully!");
        // Remove the deleted course from the state
        setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId));
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course.");
      }
    }
  };


  // Reset the form to initial state
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSubject("");
    setTopic("");
    setIsHidden(false); // Reset isHidden
    setCourseImg(null);
    setEditingCourse(null);
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">{editingCourse ? "Edit Course" : "Add Course"}</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
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
          title="desc"
            className="border p-2 w-full rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
          <input
          title="file"
            type="file"
            accept="image/*"
            onChange={(e) => setCourseImg(e.target.files?.[0] || null)}
          />
          {editingCourse && editingCourse.courseImg && (
            <p className="text-sm text-gray-600 mt-2">Current Image: {editingCourse.courseImg}</p>
          )}
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
          title="subject"
            className="border p-2 w-full rounded-md"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {subjects.map((subj) => (
              <option key={subj._id} value={subj._id}>
                {subj.name}
              </option>
            ))}
          </select>
          {/* <input
            type="text"
            className="border p-2 w-full rounded-md mt-2"
            placeholder="Enter new subject name"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
          /> */}
          {/* <button
            type="button"
            onClick={handleAddSubject}
            className="mt-2 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            Add New Subject
          </button> */}
        </div>

        {subject && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select
            title="topic"
              className="border p-2 w-full rounded-md"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Select a topic</option>
              {topics.map((top) => (
                <option key={top._id} value={top._id}>
                  {top.name}
                </option>
              ))}
            </select>
            {/* <input
              type="text"
              className="border p-2 w-full rounded-md mt-2"
              placeholder="Enter new topic name"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Add New Topic
            </button> */}
          </div>
        )}

        {/* Checkbox for isHidden */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hide this Course</label>
          <input
          title="isHidden"
            type="checkbox"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          {editingCourse ? "Update Course" : "Add Course"}
        </button>
        {editingCourse && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 ml-4"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* List of Courses */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Existing Courses</h2>
        <ul className="space-y-4">
          {courses.map((course) => (
            <li key={course._id} className="p-4 bg-gray-100 rounded-md shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.description}</p>
                {course.courseImg && (
                  <img src={course.courseImg} alt="Course Thumbnail" className="w-20 h-20 mt-2 rounded-md" />
                )}
                <p className="text-sm text-gray-600">
                  Hidden: {course.isHidden ? "Yes" : "No"}
                </p>
              </div>


              <button
                onClick={() => handleEditClick(course)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Edit
              </button>
              <button
                  onClick={() => handleDelete(course._id)}
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

export default ManageCourses;
