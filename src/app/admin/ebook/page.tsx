"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface EBook {
  _id: string;
  title: string;
  url: string;
  ebookImg: string;
  subject: { _id: string; name: string };
}

interface Subject {
  _id: string;
  name: string;
}

const ManageEBooks = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [ebookImg, setEbookImg] = useState<File | null>(null);
  const [existingEBookImg, setExistingEBookImg] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [ebooks, setEBooks] = useState<EBook[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEBookId, setCurrentEBookId] = useState<string | null>(null);

  // Fetch subjects and eBooks on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectResponse, ebookResponse] = await Promise.all([
          axios.get(`/api/subjects`),
          axios.get(`/api/ebook`),
        ]);
        setSubjects(subjectResponse.data);
        setEBooks(ebookResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("url", url);
    formData.append("subject", selectedSubject);
    if (ebookImg) {
      formData.append("ebookImg", ebookImg);
    }

    try {
      const endpoint = isEditing ? `/api/ebook/edit` : `/api/ebook`;
      const method = isEditing ? "POST" : "POST";

      if (isEditing && currentEBookId) {
        formData.append("_id", currentEBookId);
      }

      await axios({
        url: endpoint,
        method,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedEBooks = await axios.get(`/api/ebook`);
      setEBooks(updatedEBooks.data);

      // Reset form
      setTitle("");
      setUrl("");
      setSelectedSubject("");
      setEbookImg(null);
      setExistingEBookImg(null);
      setIsEditing(false);
      setCurrentEBookId(null);

      alert(isEditing ? "eBook updated successfully!" : "eBook added successfully!");
    } catch (error) {
      console.error("Error saving eBook:", error);
      alert("Failed to save eBook.");
    }
  };

  const handleEdit = (ebook: EBook) => {
    setTitle(ebook.title);
    setUrl(ebook.url);
    setSelectedSubject(ebook.subject?._id || "");
    setExistingEBookImg(ebook.ebookImg || null); // Show existing image if available
    setEbookImg(null); // Images aren't pre-filled; upload new one if required
    setIsEditing(true);
    setCurrentEBookId(ebook._id);
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit eBook" : "Add eBook"}
      </h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">eBook Title</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive URL</label>
          <input
          title="url"
            type="url"
            className="border p-2 w-full rounded-md"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">eBook Thumbnail</label>
          {existingEBookImg && (
            <img
              src={existingEBookImg}
              alt="Existing Thumbnail"
              className="w-32 h-32 object-cover mb-2"
            />
          )}
          <input
          title="file"
            type="file"
            accept="image/*"
            onChange={(e) => setEbookImg(e.target.files?.[0] || null)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
          title="selectedSub"
            className="border p-2 w-full rounded-md"
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
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
          {isEditing ? "Update eBook" : "Add eBook"}
        </button>
      </form>

      <h2 className="text-xl font-bold mt-8">Existing eBooks</h2>
      <ul className="mt-4 space-y-4">
        {ebooks.map((ebook) => (
          <li key={ebook._id} className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center">
              <img
                src={ebook.ebookImg}
                alt={ebook.title}
                className="w-16 h-16 object-cover mr-4"
              />
              <div>
                <p className="text-lg font-semibold">{ebook.title}</p>
                <p className="text-sm text-gray-500">
                  {ebook.subject ? ebook.subject.name : "No Subject"}
                </p>

              </div>
            </div>
            <button
              onClick={() => handleEdit(ebook)}
              className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageEBooks;
