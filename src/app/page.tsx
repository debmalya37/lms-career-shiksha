"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BellIcon, UserIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationPopup from '@/components/NotificationPopup';
import LiveClasses from '@/components/LiveClasses';
import Footer from '@/components/Footer';

// Define the structure of a course
interface Course {
  _id: string;
  title: string;
  description: string;
  subjects: { name: string }[] | string[]; // Handle both populated and non-populated subjects
  createdAt: string;
  isHidden?: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  subscription: number;
  courses: Course[];  // Array of user courses
}
interface AdminNotification {
  _id: string;
  text: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [latestLiveClass, setLatestLiveClass] = useState<any>(null);
  const [latestTutorial, setLatestTutorial] = useState<any>(null);
  const [userCourses, setUserCourses] = useState<Course[]>([]); // Store all user courses
  const [unsubscribedCourses, setUnsubscribedCourses] = useState<Course[]>([]); // Courses user hasn't subscribed to
  const [allCourses, setAllCourses] = useState<Course[]>([]); // All available courses
  const [latestCourse, setLatestCourse] = useState<any>(null);
  const [latestLiveClasses, setLatestLiveClasses] = useState<any[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

  // Check for session token and redirect if missing
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await axios.get(`/api/session-status`, { withCredentials: true });
        if (!res.data.sessionActive) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        router.push("/login");
      }
    }
    checkSession();
  }, [router]);

  // Fetch user profile and courses
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user profile
        const profileRes = await axios.get(`https://civilacademyapp.com/api/profile`);
        const profileData: UserProfile = profileRes.data;
        console.log("Profile Data:", profileData);
        
        // Set user courses
        if (profileData?.courses?.length) {
          setUserCourses(profileData.courses); // Use `courses` from API
        }
        
        // Fetch all courses
        const allCoursesRes = await axios.get(`https://civilacademyapp.com/api/course/admin`);
        if (allCoursesRes.data) {
          setAllCourses(allCoursesRes.data);
        }
        
        // Fetch admin notifications
        const notificationsRes = await axios.get(`/api/notifications`);
        setAdminNotifications(notificationsRes.data);

        // Fetch the latest tutorial
        const tutorialRes = await axios.get(`https://civilacademyapp.com/api/latestTutorial`);
        if (tutorialRes.data) setLatestTutorial(tutorialRes.data);
  
        // Fetch the latest live classes for all user courses
        if (profileData.courses?.length) {
          const courseIds = profileData.courses.map((course) => course._id).join(",");
          const liveClassesRes = await axios.get(
            `https://civilacademyapp.com/api/live-classes?courseIds=${courseIds}`
          );
          if (liveClassesRes.data) setLatestLiveClasses(liveClassesRes.data);
        }
  
        // Fetch the latest course
        const courseRes = await axios.get(`https://civilacademyapp.com/api/latestCourse`);
        if (courseRes.data) setLatestCourse(courseRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);
  

  // Filter unsubscribed courses
  useEffect(() => {
    if (allCourses.length && userCourses.length) {
      const subscribedIds = userCourses.map(course => course._id);
      const filteredCourses = allCourses.filter(course => !subscribedIds.includes(course._id));
      setUnsubscribedCourses(filteredCourses);
    }
  }, [allCourses, userCourses]);

  return (
    <main className="bg-yellow-100 min-h-screen">
      <div className="container relative p-2 sm:p-4 ml-0 mr-0 pl-0 pr-0">
        <div className="relative w-full flex justify-end mt-6">
          <div className="flex items-center space-x-4 absolute right-0">
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
            latestLiveClasses={latestLiveClasses}
            latestTutorial={latestTutorial}
            latestCourse={latestCourse}
            adminNotifications={adminNotifications} // Pass admin notifications
          />
        )}

        <LiveClasses liveClasses={latestLiveClasses} />

        <div className="container mx-auto mt-6">
          <div className="mt-6">
            {userCourses.length > 0 ? (
              <div>
                {/* <h2 className="text-lg sm:text-2xl font-bold text-green-800 ml-2 sm:ml-5">
                  Your Subscribed Courses:
                </h2> */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mx-2 sm:mx-0">
                {userCourses.length > 0 ? (
  <div>
    <h2 className="text-lg sm:text-2xl font-bold text-green-800 ml-2 sm:ml-5">
      Your Subscribed Courses:
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mx-2 sm:mx-0">
      {userCourses.map((course: Course) => (
        <div key={course._id} className="border p-4 rounded-lg bg-green-200 shadow-md">
          <h3 className="text-base sm:text-lg font-semibold">{course.title}</h3>
          <p className="text-gray-600 text-sm">{course.description}</p>
          {/* <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Subjects: {course.subjects.map(subject => typeof subject === 'string' ? subject : subject.name).join(', ')}
          </p> */}
          <p className="text-xs sm:text-sm text-gray-500">
            Created At: {new Date(course.createdAt).toLocaleDateString()}
          </p>
          <Link href={`/courses/${course._id}`}>
            <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
              Go to Course
            </button>
          </Link>
        </div>
      ))}
    </div>
  </div>
) : (
  <p className="text-gray-600 text-sm sm:text-base ml-2">You have no active subscriptions.</p>
)}

                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm sm:text-base ml-2">You have no active subscriptions.</p>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg sm:text-2xl font-bold text-green-800 ml-2 sm:ml-5">Courses You Haven&apos;t Subscribed To:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mx-2 sm:mx-0">
              {unsubscribedCourses.map((course: Course) => (
                <div key={course._id} className="border p-4 rounded-lg bg-green-200 shadow-md">
                  <h3 className="text-base sm:text-lg font-semibold">{course.title}</h3>
                  <p className="text-gray-600 text-sm">{course.description}</p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    Subjects: {course.subjects.map(subject => typeof subject === 'string' ? subject : subject.name).join(', ')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Created At: {new Date(course.createdAt).toLocaleDateString()}</p>
                  <Link href={`/contact`}>
                    <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
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
