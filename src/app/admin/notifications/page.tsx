"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Notification {
  _id: string;
  text: string;
  createdAt: string;
}

export default function ManageNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationText, setNotificationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/api/notifications`);
        setNotifications(response.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  // Handle form submission to post a new notification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notificationText.trim()) {
      setError("Notification text is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/notifications`, { text: notificationText });
      alert(response.data.message);

      // Refresh notifications after adding
      const updatedNotifications = await axios.get(`/api/notifications`);
      setNotifications(updatedNotifications.data);

      // Reset form
      setNotificationText("");
    } catch (err) {
      console.error("Error adding notification:", err);
      alert("Failed to add notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-3xl mx-auto mt-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Manage Notifications</h1>

      {/* Notification Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notification Text
        </label>
        <textarea
          title="notificationText"
          className="border p-2 w-full rounded-md"
          rows={4}
          value={notificationText}
          onChange={(e) => setNotificationText(e.target.value)}
          placeholder="Enter notification message..."
          required
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post Notification"}
        </button>
      </form>

      {/* Notifications List */}
      <h2 className="text-xl font-semibold mb-4">Existing Notifications</h2>
      {notifications.length > 0 ? (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification._id} className="p-4 bg-gray-100 rounded-md shadow">
              <p className="text-gray-700">{notification.text}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
}
