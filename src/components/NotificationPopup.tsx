"use client";
import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';

interface LatestVideo {
    title: string;
    subject: string;
    topic: string;
    createdAt: string;
  }

interface NotificationPopupProps {
  close: () => void;
}

const NotificationPopup = ({ close }: NotificationPopupProps) => {
    const [latestVideo, setLatestVideo] = useState<LatestVideo | null>(null);
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(30); // Example placeholder
  const [progress, setProgress] = useState(50); // Example progress value
  const [examMarks, setExamMarks] = useState(80); // Example exam marks

  useEffect(() => {
    async function fetchLatestVideo() {
      // Fetch the latest video data from API
      const response = await fetch('/api/latest-video');
      const data = await response.json();
      setLatestVideo(data);
    }
    fetchLatestVideo();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button onClick={close} className="absolute top-2 right-2 text-gray-600">✖</button>
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Notifications</h2>
        
        {/* Latest Video */}
        {latestVideo && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-green-700">Latest Video</h3>
            <p>Title: {latestVideo.title}</p>
            <p>Subject: {latestVideo.subject}</p>
            <p>Topic: {latestVideo.topic}</p>
            <p>Date: {new Date(latestVideo.createdAt).toLocaleDateString()}</p>
          </div>
        )}

        {/* Subscription Days Left */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-red-600">Subscription</h3>
          <p className='text-black'>{subscriptionDaysLeft} days left</p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-green-700">Progress Tracker</h3>
          <ProgressBar progress={progress} />
        </div>

        {/* Test Exam Marks */}
        <div>
          <h3 className="font-semibold text-lg text-blue-700">Test Exam Marks</h3>
          <p className='text-black'>{examMarks} out of 100</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
