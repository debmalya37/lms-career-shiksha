"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Define the Topic type
interface Topic {
  _id: string;
  name: string;
}

// Define the Subject type
interface Subject {
  _id: string;
  name: string;
}

const ManageTopics = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topicName, setTopicName] = useState("");
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Fetch subjects for the dropdown selection
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

  // Fetch topics based on selected subject
  useEffect(() => {
    const fetchTopics = async () => {
      if (selectedSubject) {
        try {
          const res = await axios.get(`/api/topics?subject=${selectedSubject}`);
          setTopics(res.data);
        } catch (error) {
          console.error("Error fetching topics:", error);
        }
      }
    };
    fetchTopics();
  }, [selectedSubject]);

  // Handle form submission to add or edit a topic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTopic) {
        // Update existing topic
        const updatedTopicData = { id: editingTopic._id, name: topicName, subject: selectedSubject };
        await axios.post(`/api/topics/edit`, updatedTopicData);
        alert("Topic updated successfully!");
      } else {
        // Add new topic
        const newTopicData = { name: topicName, subject: selectedSubject };
        const response = await axios.post(`/api/topics`, newTopicData);
        const newTopic = response.data;
        setTopics((prevTopics) => [...prevTopics, newTopic]); // Update UI with new topic
        alert("Topic added successfully!");
      }

      // Reset form and refresh topics
      setTopicName("");
      setEditingTopic(null);
      const res = await axios.get(`/api/topics?subject=${selectedSubject}`);
      setTopics(res.data);
    } catch (error) {
      console.error("Error adding/updating topic:", error);
      alert("Failed to add/update topic.");
    }
  };

  // Handle edit button click
  const handleEditClick = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicName(topic.name); // Pre-fill the input field with the topic name
  };

  // Handle delete button click
  const handleDeleteClick = async (topicId: string) => {
    if (confirm("Are you sure you want to delete this topic?")) {
      try {
        await axios.delete(`/api/topics/delete?id=${topicId}`);
        alert("Topic deleted successfully!");
        // Refresh the topic list
        setTopics((prevTopics) => prevTopics.filter((topic) => topic._id !== topicId));
      } catch (error) {
        console.error("Error deleting topic:", error);
        alert("Failed to delete topic.");
      }
    }
  };

  // Reset the form
  const resetForm = () => {
    setEditingTopic(null);
    setTopicName("");
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">{editingTopic ? "Edit Topic" : "Add New Topic"}</h1>

      {/* Subject Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
        <select
          title="selectSubject"
          className="border p-2 w-full rounded-md"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          required
        >
          <option value="">Choose a subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Topic List */}
      {selectedSubject && topics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">
            Topics under {subjects.find((s) => s._id === selectedSubject)?.name}
          </h2>
          <ul className="list-disc pl-5">
            {topics.map((topic) => (
              <li key={topic._id} className="flex justify-between items-center mb-2">
                <span>{topic.name}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(topic)}
                    className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(topic._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add/Edit Topic Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{editingTopic ? "Edit Topic Name" : "New Topic Name"}</label>
          <input
            title="newTopicName"
            type="text"
            className="border p-2 w-full rounded-md"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            required
            placeholder="Enter topic name"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          disabled={!selectedSubject}
        >
          {editingTopic ? "Update Topic" : "Add Topic"}
        </button>
        {editingTopic && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 ml-4"
          >
            Cancel Edit
          </button>
        )}
      </form>
    </div>
  );
};

export default ManageTopics;
