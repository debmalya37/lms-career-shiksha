"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BellIcon, UserIcon } from '@heroicons/react/24/solid';
import Navbar from '@/components/Navbar';
import LiveClasses from '@/components/LiveClasses';
import Footer from '@/components/Footer';
import NotificationPopup from '@/components/NotificationPopup';
import Link from 'next/link';

// Define the structure of a course
interface Course {
  _id: string;
  title: string;
  description: string;
  subjects: { name: string }[];
  createdAt: string; // Or use Date if you handle it as a Date object later
}

export default function Home() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [latestLiveClass, setLatestLiveClass] = useState<any>(null);
  const [latestTutorial, setLatestTutorial] = useState<any>(null);
  const [latestCourse, setLatestCourse] = useState<any>(null);
  const [userCourse, setUserCourse] = useState<Course | null>(null); // Use Course type here
  const [allCourses, setAllCourses] = useState<Course[]>([]); // Array of Course
  const [unsubscribedCourses, setUnsubscribedCourses] = useState<Course[]>([]); // Array of Course

  // Fetch user profile to get the subscribed course and all courses
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user profile
        const profileRes = await axios.get(`https://www.civilacademyapp.com/api/profile`);
        console.log("Profile Data:", profileRes.data); // Log the profile response

        if (profileRes.data && profileRes.data.course) {
          console.log("User's Course Title:", profileRes.data.course.title); // Log the course title
          setUserCourse(profileRes.data.course); // Store the entire course object
        }

        // Fetch all courses
        const allCoursesRes = await axios.get(`https://www.civilacademyapp.com/api/course`);
        if (allCoursesRes.data) {
          setAllCourses(allCoursesRes.data);
        }

        // Fetch the latest tutorial
        const tutorialRes = await axios.get(`https://www.civilacademyapp.com/api/latestTutorial`);
        if (tutorialRes.data) setLatestTutorial(tutorialRes.data);
        
        // Fetch the latest live class
        const liveClassRes = await axios.get(`https://www.civilacademyapp.com/api/latest-live`);
        if (liveClassRes.data) setLatestLiveClass(liveClassRes.data);

        // Fetch the latest course
        const courseRes = await axios.get(`https://www.civilacademyapp.com/api/latestCourse`);
        if (courseRes.data) setLatestCourse(courseRes.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  // Filter unsubscribed courses
  useEffect(() => {
    if (allCourses.length && userCourse) {
      const filteredCourses = allCourses.filter((course: Course) => course._id !== userCourse._id);
      setUnsubscribedCourses(filteredCourses);
    }
  }, [allCourses, userCourse]);

  return (
    <main className='bg-yellow-100'>
  <div className="bg-yellow-100 min-h-screen relative">
    <div className="container mx-auto flex justify-between items-center">
      {/* <input
        type="text"
        placeholder="Search"
        className="block w-full max-w-lg mt-6 mx-auto bg-green-100 p-2 rounded-md"
      /> */}
      <div className="flex items-center space-x-4 mt-6 relative left-[93%]">
        <BellIcon
          className="h-8 w-8 text-blue-600 cursor-pointer"
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        />
        <Link href="/profile">
          <UserIcon className="h-8 w-8 text-blue-600 cursor-pointer" />
        </Link>
      </div>
    </div>
    
    {isNotificationOpen && (
      <NotificationPopup
        close={() => setIsNotificationOpen(false)}
        latestLiveClass={latestLiveClass}
        latestTutorial={latestTutorial}
        latestCourse={latestCourse}
      />
    )}

    <LiveClasses liveClass={latestLiveClass} />
    
    <div className="container mx-auto mt-6">
      <div className="mt-6">
        {userCourse ? (
          <h2 className="text-2xl font-bold text-green-800 ml-5">
            Your Subscribed Course: 
            <Link href={`/courses/${userCourse._id}`}>
              <span className="text-blue-600 underline ml-2">{userCourse.title}</span>
            </Link>
          </h2>
        ) : (
          <p className="text-gray-600">You have no active subscriptions.</p>
        )}
      </div>

      <div className="mt-10">
      <h2 className="text-2xl font-bold text-green-800 ml-5">Courses You Haven&apos;t Subscribed To:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 ml-4 mr-3">
          {unsubscribedCourses.map((course: Course) => (
            <div key={course._id} className="border p-4 rounded-lg bg-green-200 shadow-md">
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="text-gray-600">{course.description}</p>
              <p className="mt-2 text-sm text-gray-500">Subject: {course.subjects.map(subject => subject.name).join(', ')}</p>
              <p className="text-sm text-gray-500">Created At: {new Date(course.createdAt).toLocaleDateString()}</p>
              <Link href={`/contact`}>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
                  Contact Us
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
</main>
  );
}
