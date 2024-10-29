"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BellIcon, UserIcon } from '@heroicons/react/24/solid';
import Navbar from '@/components/Navbar';
import LiveClasses from '@/components/LiveClasses';
import Subjects from '@/components/Subjects';
import Footer from '@/components/Footer';
import NotificationPopup from '@/components/NotificationPopup';
import Link from 'next/link';

export default function Home() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [latestLiveClass, setLatestLiveClass] = useState(null);
  const [latestTutorial, setLatestTutorial] = useState(null);
  const [latestCourse, setLatestCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Fetch latest live class, tutorial, course, and subjects
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch subjects
        const subjectsRes = await axios.get('/api/subjects');
        setSubjects(subjectsRes.data);
        // Fetch the latest live class
        const liveClassRes = await axios.get('/api/latest-live');
        if (liveClassRes.data) setLatestLiveClass(liveClassRes.data);

        // Fetch the latest tutorial
        const tutorialRes = await axios.get('/api/latestTutorial');
        if (tutorialRes.data) setLatestTutorial(tutorialRes.data);

        // Fetch the latest course
        const courseRes = await axios.get('/api/latestCourse');
        if (courseRes.data) setLatestCourse(courseRes.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <>
    <main className='bg-yellow-100'>
    <div className="bg-yellow-100 min-h-screen relative">
      <div className="container mx-auto flex justify-between items-center">
        <input
          type="text"
          placeholder="Search"
          className="block w-full max-w-lg mt-6 mx-auto bg-green-100 p-2 rounded-md"
        />
        
        {/* Notification Bell and Profile Icons */}
        <div className="flex items-center space-x-4 mt-6">
          <BellIcon
            className="h-8 w-8 text-blue-600 cursor-pointer"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          />
          <Link href="/profile">
            <UserIcon className="h-8 w-8 text-blue-600 cursor-pointer" />
          </Link>
        </div>
      </div>
      
      {/* Show Notification Popup if open */}
      {isNotificationOpen && (
        <NotificationPopup
          close={() => setIsNotificationOpen(false)}
          latestLiveClass={latestLiveClass}
          latestTutorial={latestTutorial}
          latestCourse={latestCourse}
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto">
        <LiveClasses liveClass={latestLiveClass} /> {/* Pass the latest live class */}
        <Subjects subjects={subjects} /> {/* Pass the subjects */}
      </div>
      <Footer />
    </div>
    </main>
    </>
  );
}
