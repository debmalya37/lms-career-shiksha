"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Define the Course, Subject, Topic, and Tutorial types
interface Course {
  _id: string;
  title: string;
  subjects: Subject[];

}

interface Subject {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
}

interface Tutorial {
  _id: string;
  title: string;
  url: string;
  description: string;
  subject: string;
  topic: string;
}

const ManageTutorials = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTutorialId, setCurrentTutorialId] = useState<string | null>(null);

  // Fetch courses
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

  // Fetch subjects based on selected course
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find((course) => course._id === selectedCourse);
      if (course) {
        setSubjects(course.subjects); // Extract subjects directly from the selected course
      } else {
        setSubjects([]); // Clear subjects if no course matches
      }
    } else {
      setSubjects([]); // Clear subjects if no course is selected
    }
  }, [selectedCourse, courses]);
  

  // Fetch topics based on selected subject
  useEffect(() => {
    if (selectedSubject) {
      const fetchTopics = async () => {
        try {
          const response = await axios.get(`/api/topics?subject=${selectedSubject}`);
          setTopics(response.data);
        } catch (error) {
          console.error("Error fetching topics:", error);
        }
      };
      fetchTopics();
    }
  }, [selectedSubject]);

  // Fetch all tutorials
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await axios.get(`/api/tutorials`);
        setTutorials(response.data);
      } catch (error) {
        console.error("Error fetching tutorials:", error);
      }
    };
    fetchTutorials();
  }, []);
  const handleEditTutorial = async (tutorial: Tutorial) => {
    try {
      // Prefill the tutorial details
      setTitle(tutorial.title);
      setUrl(tutorial.url);
      setDescription(tutorial.description);
      setSelectedTopic(tutorial.topic || "");
      setIsEditing(true);
      setCurrentTutorialId(tutorial._id);
  
      // Fetch topic details
      const topicRes = await axios.get(`/api/topics/specific?topic=${tutorial.topic}`);
      const topic = topicRes.data[0]; // Ensure topic exists
      if (!topic) {
        throw new Error("Topic not found");
      }
  
      // Fetch subject details
      const subjectRes = await axios.get(`/api/subjects/specific?subject=${topic.subject}`);
      const subject = subjectRes.data[0];
      if (!subject) {
        throw new Error("Subject not found");
      }
      setSelectedSubject(subject._id); // Prefill subject dropdown
  
      // Fetch course details
      const courseRes = await axios.get(`/api/course/specific?subjectId=${subject._id}`);
      const course = courseRes.data[0]; // Assuming courses return as an array
      if (!course) {
        throw new Error("Course not found");
      }
      setSelectedCourse(course._id); // Prefill course dropdown
    } catch (error) {
      console.error("Error prefetching tutorial details:", error);
      alert("Failed to prefill tutorial details.");
    }
  };
  
  const handleAddTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiEndpoint = isEditing
        ? `/api/tutorials/edit`
        : `/api/tutorials`;

      const payload = {
        title,
        url,
        description,
        subject: selectedSubject,
        topic: selectedTopic,
        ...(isEditing && { _id: currentTutorialId }),
      };

      await axios.post(apiEndpoint, payload);

      // Refresh tutorials list
      const response = await axios.get(`/api/tutorials`);
      setTutorials(response.data);

      // Reset form and state
      setTitle("");
      setUrl("");
      setDescription("");
      setSelectedCourse("");
      setSelectedSubject("");
      setSelectedTopic("");
      setIsEditing(false);
      setCurrentTutorialId(null);

      alert(isEditing ? "Tutorial updated successfully!" : "Tutorial added successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving tutorial.");
    }
  };

  

  const handleAddSubject = async () => {
    if (!newSubjectName || !selectedCourse) {
      alert("Please enter a subject name and select a course.");
      return;
    }
    try {
      const response = await axios.post(`/api/subjects`, {
        name: newSubjectName,
        course: selectedCourse,
      });
      setSubjects((prevSubjects) => [...prevSubjects, response.data]);
      setNewSubjectName("");
      alert("New subject added successfully!");
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("Failed to add subject.");
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName || !selectedSubject) {
      alert("Please enter a topic name and select a subject.");
      return;
    }
    try {
      const response = await axios.post(`/api/topics`, {
        name: newTopicName,
        subject: selectedSubject,
      });
      setTopics((prevTopics) => [...prevTopics, response.data]);
      setNewTopicName("");
      alert("New topic added successfully!");
    } catch (error) {
      console.error("Error adding topic:", error);
      alert("Failed to add topic.");
    }
  };

  const handleDeleteTutorial = async (tutorialId: string) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) return;

    try {
      await axios.delete(`/api/tutorials/delete?id=${tutorialId}`);

      // Refresh tutorials list
      const response = await axios.get(`/api/tutorials`);
      setTutorials(response.data);

      alert("Tutorial deleted successfully!");
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      alert("Failed to delete tutorial.");
    }
  };
  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-3xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">{isEditing ? "Edit Tutorial Video" : "Add Tutorial Video"}</h1>
      <form onSubmit={handleAddTutorial}>
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
          title="desc"
            className="border p-2 w-full rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (YouTube Embed)</label>
          <input
          title="text"
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
          title="selectedCourse"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
          title="selectedSub"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <select
          title="selectedTopic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            required
          >
            <option value="">Select Topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          {isEditing ? "Update Tutorial Video" : "Add Tutorial Video"}
        </button>
      </form>
              {/* Add New Subject Section */}
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

      {/* Add New Topic Section */}
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
      {/* Tutorial List */}
      <h2 className="text-xl font-bold text-gray-700 mt-8">Existing Tutorials</h2>
      <ul className="mt-4">
        {tutorials.map((tutorial) => (
          <li key={tutorial._id} className="border-b py-4 flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">{tutorial.title}</p>
              <p className="text-sm text-gray-500">{tutorial.description}</p>
            </div>
            <button
              onClick={() => handleEditTutorial(tutorial)}
              className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
                onClick={() => handleDeleteTutorial(tutorial._id)}
                className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageTutorials;