// app/admin/popup/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

interface PopupNotification {
  _id: string;
  title: string;
  imageUrl?: string;
  date: string;
  isActive: boolean;
  createdAt: string;
}

export default function PopupManagementPage() {
  const [notifications, setNotifications] = useState<PopupNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    image: null as File | null,
  });
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/popup-notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('date', formData.date);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('/api/popup-notifications', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        // Reset form
        setFormData({
          title: '',
          date: '',
          image: null,
        });
        setPreviewImage('');
        
        // Refresh notifications list
        fetchNotifications();
        alert('Notification created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create notification'}`);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleNotificationStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/popup-notifications?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchNotifications();
      } else {
        alert('Failed to update notification status');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      alert('Failed to update notification status');
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const response = await fetch(`/api/popup-notifications?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNotifications();
      } else {
        alert('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Popup Notification Management</h1>
          <p className="mt-2 text-gray-600">Create and manage popup notifications for your users.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Notification Form */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Notification</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <textarea
                  id="title"
                  name="title"
                  rows={3}
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notification title..."
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {previewImage && (
                  <div className="mt-4">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? 'Creating...' : 'Create Notification'}
              </button>
            </form>
          </div>

          {/* Existing Notifications List */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Existing Notifications</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications found. Create your first one!
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Date: {formatDate(notification.date)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {formatDate(notification.createdAt)}
                        </p>
                        {notification.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={notification.imageUrl}
                              alt={notification.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleNotificationStatus(notification._id, notification.isActive)}
                          className={`p-2 rounded-md transition-colors duration-200 ${
                            notification.isActive
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={notification.isActive ? 'Active' : 'Inactive'}
                        >
                          {notification.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}