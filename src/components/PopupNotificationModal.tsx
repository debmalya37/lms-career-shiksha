// components/PopupNotificationModal.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface PopupNotification {
  _id: string;
  title: string;
  imageUrl?: string;
  date: string;
  isActive: boolean;
}

interface PopupNotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const PopupNotificationModal: React.FC<PopupNotificationModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<PopupNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      fetchNotifications();
    }
  }, [isVisible]);

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

  const currentNotification = notifications[currentIndex];

  const nextNotification = () => {
    setCurrentIndex((prev) => (prev + 1) % notifications.length);
  };

  const prevNotification = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? notifications.length - 1 : prev - 1
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all duration-200"
          aria-label="Close notification"
        >
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : (
          <>
            {/* Notification Content */}
            <div className="p-6 pb-4">
              {/* Image */}
              {currentNotification?.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img
                    src={currentNotification.imageUrl}
                    alt={currentNotification.title}
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {currentNotification?.title}
              </h2>

              {/* Date */}
              <p className="text-sm text-gray-500 mb-4">
                {formatDate(currentNotification?.date)}
              </p>
            </div>

            {/* Navigation & Controls */}
            <div className="px-6 pb-6">
              {notifications.length > 1 && (
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevNotification}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    ← Previous
                  </button>
                  
                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} of {notifications.length}
                  </span>
                  
                  <button
                    onClick={nextNotification}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Dots Indicator */}
              {notifications.length > 1 && (
                <div className="flex justify-center space-x-2 mb-4">
                  {notifications.map((_, index) => (
                    <button
                    title='Go to notification'
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentIndex
                          ? 'bg-blue-600 w-6'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Got it!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PopupNotificationModal;