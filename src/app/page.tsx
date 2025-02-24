"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BellIcon, UserIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationPopup from '@/components/NotificationPopup';
import LiveClasses from '@/components/LiveClasses';
import Footer from '@/components/Footer';
import DisableRightClickAndClipboard from '@/components/DisableRightClick';
import MobileClipboardFunction from '@/components/MobileClipboard';


// Define the structure of a course
interface Course {
  _id: string;
  title: string;
  description: string;
  courseImg?: string;
  subjects: { name: string }[] | string[]; // Handle both populated and non-populated subjects
  createdAt: string;
  isHidden?: boolean;
}
interface BannerAd {
  _id: string;
  imageUrl: string;
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
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

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
  const convertToEmbedUrl = (url: string): string => {
    const embedUrlRegex = /^https:\/\/www\.youtube\.com\/embed\//;
    const normalUrlRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const liveUrlRegex = /^https:\/\/(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)/;
  
    if (embedUrlRegex.test(url)) {
      // If already an embed URL, return as is
      return url;
    }
  
    const normalMatch = url.match(normalUrlRegex);
    if (normalMatch) {
      const videoId = normalMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  
    const liveMatch = url.match(liveUrlRegex);
    if (liveMatch) {
      const videoId = liveMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  
    return url; // Return as is if it's not a recognizable YouTube URL
  };

  // Fetch user profile and courses
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user profile
        const profileRes = await axios.get(`/api/profile`);
        const profileData: UserProfile = profileRes.data;
        console.log("Profile Data:", profileData);
        
        // Set user courses
        if (profileData?.courses?.length) {
          setUserCourses(profileData.courses); // Use `courses` from API
        }
        
        // Fetch all courses
        const allCoursesRes = await axios.get(`/api/course`);
        if (allCoursesRes.data) {
          setAllCourses(allCoursesRes.data);
        }
        
        // Fetch admin notifications
        const notificationsRes = await axios.get(`/api/notifications`);
        setAdminNotifications(notificationsRes.data);

        // Fetch the latest tutorial
        const tutorialRes = await axios.get(`/api/latestTutorial`);
        if (tutorialRes.data) setLatestTutorial(tutorialRes.data);
  
        // Fetch the latest live classes for all user courses
      if (profileData.courses?.length) {
        const courseIds = profileData.courses.map((course) => course._id).join(",");
        const liveClassesRes = await axios.get(
          `/api/live-classes?courseIds=${courseIds}`
        );
        if (liveClassesRes.data) {
          const transformedLiveClasses = liveClassesRes.data.map((liveClass: any) => ({
            ...liveClass,
            url: convertToEmbedUrl(liveClass.url), // Convert URL to embed format
          }));
          setLatestLiveClasses(transformedLiveClasses);
        }
      }
  
        // Fetch the latest course
        const courseRes = await axios.get(`/api/latestCourse`);
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
  // Fetch banner ads
  useEffect(() => {
    async function fetchBannerAds() {
      try {
        const res = await axios.get('/api/bannerAds');
        setBannerAds(res.data);
      } catch (error) {
        console.error('Error fetching banner ads:', error);
      }
    }
    fetchBannerAds();
  }, []);

  // Auto-slide the ads
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % bannerAds.length);
    }, 10000); // Slide every 1 second
    return () => clearInterval(interval);
  }, [bannerAds]);

  return (
    <main className="bg-gradient-to-b from-gray-950 to-blue-950 min-h-screen">
      <DisableRightClickAndClipboard/>
      {/* <MobileClipboardFunction/> */}
      <div className="container relative p-2 sm:p-4 ml-0 mr-0 pl-0 pr-0">
        {/* Hero Section */}
        {bannerAds.length > 0 && (
  <div className="w-full h-0 pb-[37.5%] bg-gray-200 overflow-hidden relative mb-6">
    <img
      src={bannerAds[currentAdIndex]?.imageUrl}
      alt={`Banner Ad ${currentAdIndex + 1}`}
      className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
    />
  </div>
)}



      
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
        

        {/* <LiveClasses liveClasses={latestLiveClasses} /> */}

        <div className="container mx-auto mt-6">
          <div className="mt-6">
            {userCourses.length > 0 ? (
              <div>
                {/* <h2 className="text-lg sm:text-2xl font-bold text-green-800 ml-2 sm:ml-5">
                  Your Subscribed Courses:
                </h2> */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mx-2 sm:mx-0">
                {userCourses.length > 0 ? (
  <div className="m-5">
  <h2 className="text-lg sm:text-2xl font-bold text-green-500 ml-2 sm:ml-5">
    Your Subscribed Courses:
  </h2>
  <div className="grid grid-cols-1 m-3 sm:grid-cols-1 lg:grid-cols-1 gap-4 mt-4 mx-2 sm:mx-0">
    {userCourses.map((course: Course) => (
      <div
      key={course._id}
      className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-sm h-96 flex flex-col"
    >
      {/* Course Image */}
      {course.courseImg && (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={course.courseImg}
            alt={`${course.title} Thumbnail`}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}
    
      {/* Course Details */}
      <div className="p-4 flex flex-col flex-1 justify-between ">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-black truncate">{course.title}</h3>
          <p className="text-gray-700 mb-2 line-clamp-3">{course.description}</p>
          <p className="text-gray-500 mb-2 text-sm">
            Created on: {new Date(course.createdAt).toLocaleDateString()}
          </p>
        </div>
    
        <Link href={`/courses/${course._id}`}>
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            View
          </button>
        </Link>
      </div>
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

          <div className="mt-6 m-5">
  <h2 className="text-lg sm:text-2xl font-bold text-green-600 ml-2 sm:ml-5">
    Courses You Haven&apos;t Subscribed To:
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mx-2 sm:mx-0">
    {unsubscribedCourses.map((course: Course) => (
      <div
      key={course._id}
      className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-sm h-96 flex flex-col"
    >
      {/* Course Image */}
      {course.courseImg && (
        <div className="h-48 w-full overflow-hidden">
        <img
          src={course.courseImg}
          alt={`${course.title} Thumbnail`}
          className="w-full h-full object-cover object-center"
        />
      </div>
      )}
    
      {/* Course Details */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-semibold mb-2 text-black truncate">{course.title}</h3>
        <p className="text-gray-700 mb-2 line-clamp-3">{course.description}</p>
        <p className="text-gray-500 mb-2 text-sm">
          Created on: {new Date(course.createdAt).toLocaleDateString()}
        </p>
        {/* <p className="text-gray-500 mb-4 text-sm truncate">
          Subjects:{" "}
          {course.subjects
            .map((subject) => (typeof subject === "string" ? subject : subject.name))
            .join(", ")}
        </p> */}
    
        <Link href={`/contact`}>
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors mt-auto">
            Contact Us
          </button>
        </Link>
      </div>
    </div>
    ))}
  </div>
</div>
        </div>
        
      </div>
    </main>
  );
}
