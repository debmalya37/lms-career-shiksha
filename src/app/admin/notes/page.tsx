"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Subject {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
}

interface Note {
  _id: string;
  title: string;
  url: string;
  subject?: Subject; // Subject populated from the database
  topic?: Topic;     // Topic populated from the database
}

const ManageNotes = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]); // Specify type for subjects
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]); // Specify type for topics
  const [selectedTopic, setSelectedTopic] = useState('');
  const [notes, setNotes] = useState<Note[]>([]); // Specify type for notes
  const [editingNote, setEditingNote] = useState<Note | null>(null); // Specify type for editing note
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`/api/subjects`);
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch topics based on selected subject
  useEffect(() => {
    if (selectedSubject) {
      const fetchTopics = async () => {
        try {
          const response = await axios.get(`/api/topics?subject=${selectedSubject}`);
          setTopics(response.data);
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      };
      fetchTopics();
    }
  }, [selectedSubject]);

  // Fetch all notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`/api/notes`);
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
    fetchNotes();
  }, []);

  // Handle form submission for both creating and updating notes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const noteData = { title, url, subject: selectedSubject, topic: selectedTopic };

    try {
      if (editingNote) {
        // Update note
        await axios.post(`/api/notes/edit`, { id: editingNote._id, ...noteData });
        alert('Note updated successfully!');
      } else {
        // Create new note
        await axios.post(`/api/notes`, noteData, {
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Note uploaded successfully!');
      }

      // Reset form and refresh notes
      setTitle('');
      setUrl('');
      setSelectedSubject('');
      setSelectedTopic('');
      setEditingNote(null);
      setShowEditModal(false);
      const response = await axios.get(`/api/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error(error);
      alert('Error uploading/updating note.');
    }
  };

  // Open edit modal with existing note data
  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setUrl(note.url);
    setSelectedSubject(note.subject?._id || '');
    setSelectedTopic(note.topic?._id || '');
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`/api/notes/delete?id=${noteId}`);
        alert('Note deleted successfully!');
        // Update the UI to remove the deleted note
        setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note.');
      }
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Manage Notes</h1>

      {/* Create or Edit Note */}
      <h2 className="text-xl font-semibold mb-4">{editingNote ? 'Edit Note' : 'Upload Note'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Note Title</label>
          <input
            title="title"
            type="text"
            className="border p-2 w-full rounded-md text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive URL</label>
          <input
            type="url"
            className="border p-2 w-full rounded-md text-black"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="Enter Google Drive Link"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
            title="sub"
            className="border p-2 w-full rounded-md text-black"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSubject && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select
              title="topic"
              className="border p-2 w-full rounded-md text-black"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              required
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
          {editingNote ? 'Update Note' : 'Upload Note'}
        </button>
      </form>

      <br />
      {/* List of Notes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Existing Notes</h2>
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note._id} className="p-4 bg-gray-100 rounded-md shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold">{note.title}</h3>
                <p className="text-sm text-gray-600">Subject: {note.subject?.name}</p>
                <p className="text-sm text-gray-600">Topic: {note.topic?.name}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditClick(note)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(note._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageNotes;
