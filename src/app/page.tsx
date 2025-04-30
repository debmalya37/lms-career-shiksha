"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BellIcon, UserIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationPopup from "@/components/NotificationPopup";
import DisableRightClickAndClipboard from "@/components/DisableRightClick";
// import MobileClipboardFunction from "@/components/MobileClipboard"; // If you still need it

// Define interfaces
interface Course {
  _id: string;
  title: string;
  description: string;
  courseImg?: string;
  subjects: { name: string }[] | string[];
  createdAt: string;
  isHidden?: boolean;
  isFree?: boolean;
}
interface BannerAd {
  _id: string;
  imageUrl: string;
}
interface UserProfile {
  name: string;
  email: string;
  subscription: number;
  courses: Course[];
}
interface AdminNotification {
  _id: string;
  text: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [latestTutorial, setLatestTutorial] = useState<any>(null);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [unsubscribedCourses, setUnsubscribedCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [latestCourse, setLatestCourse] = useState<any>(null);
  const [latestLiveClasses, setLatestLiveClasses] = useState<any[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
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

  // Convert youtube URL to embed URL
  const convertToEmbedUrl = (url: string): string => {
    const embedUrlRegex = /^https:\/\/www\.youtube\.com\/embed\//;
    const normalUrlRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const liveUrlRegex = /^https:\/\/(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)/;

    if (embedUrlRegex.test(url)) return url;
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
    return url;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await axios.get(`/api/profile`);
        const profileData: UserProfile = profileRes.data;
        console.log("Profile Data:", profileData);
  
        if (profileData?.courses?.length) {
          setUserCourses(profileData.courses);
        }
  
        const allCoursesRes = await axios.get(`/api/course`);
        if (allCoursesRes.data) {
          setAllCourses(allCoursesRes.data);
          setIsLoading(false);
        }
  
        const notificationsRes = await axios.get(`/api/notifications`);
        setAdminNotifications(notificationsRes.data);
  
        const tutorialRes = await axios.get(`/api/latestTutorial`);
        if (tutorialRes.data) setLatestTutorial(tutorialRes.data);
  
        if (profileData.courses?.length) {
          const courseIds = profileData.courses.map((course) => course._id).join(",");
          const liveClassesRes = await axios.get(`/api/live-classes?courseIds=${courseIds}`);
          if (liveClassesRes.data) {
            const transformedLiveClasses = liveClassesRes.data.map((liveClass: any) => ({
              ...liveClass,
              url: convertToEmbedUrl(liveClass.url),
            }));
            setLatestLiveClasses(transformedLiveClasses);
          }
        }
  
        const courseRes = await axios.get(`/api/latestCourse`);
        if (courseRes.data) setLatestCourse(courseRes.data);
  
        // ✅ Mark as loaded
        setIsLoading(false);
  
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Even if there's an error, stop loading
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
        const res = await axios.get("/api/bannerAds");
        setBannerAds(res.data);
      } catch (error) {
        console.error("Error fetching banner ads:", error);
      }
    }
    fetchBannerAds();
  }, []);

  // Auto-slide the ads
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % bannerAds.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [bannerAds]);

  // Inside your Home component
// Reusable Course Card

const CourseCard = ({
  course,
  buttonLabel,
  buttonLink,
}: {
  course: Course | null;
  // Use null for loading state
  buttonLabel: string;
  buttonLink: string;
}) => {

    const isFree = !!course?.isFree;
  return (
    <div className="w-64 h-72 bg-blue-950 rounded shadow hover:shadow-md transition-shadow flex flex-col overflow-hidden">
        {/* Course Image */}
        <div className="h-32 w-full bg-gray-700 flex items-center justify-center overflow-hidden rounded-md">
          {course ? (
            <img
              src={course.courseImg || "/placeholder.jpg"}
              alt={course.title}
              className="object-cover w-full h-full p-2 rounded-md transition-transform duration-300 transform hover:scale-105 rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-gray-500 animate-pulse"></div>
          )}
        </div>

        {/* Course Info */}
        <div className="flex-1 flex flex-col p-3">
          {/* Course Title */}
          <h3 className="text-lg font-bold text-gray-100 mb-1">
            {course ? course.title : <div className="w-3/4 h-5 bg-gray-500 animate-pulse rounded"></div>}
          </h3>

          {/* Description */}
          <div className="text-sm text-gray-200 flex-1">
            {course ? course.description.slice(0, 50) + "..." : <div className="w-full h-4 bg-gray-500 animate-pulse rounded"></div>}
          </div>
          {/* ← FREE sticker */}
        {/* {isFree && (
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-md w-fit">
            FREE
          </span>
        )} */}

          {/* Button */}
          <div className="flex justify-end mt-2">

            {/* ← FREE sticker */}
        {isFree && (
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-md w-fit mr-3">
            FREE
          </span>
        )}
          {course ? (
          <Link href={buttonLink}>
            <button className="text-sm text-blue-100 hover:underline">
              {buttonLabel}
            </button>
          </Link>
        ) : (
          <div className="w-16 h-5 bg-gray-500 animate-pulse rounded" />
        )}
          {/* ← FREE sticker */}
        {/* {isFree && (
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-md w-fit">
            FREE
          </span>
        )} */}
          </div>
        </div>
      </div>
  );
};


  return (
    <main className="bg-slate-300 min-h-screen text-black">
      {/* <DisableRightClickAndClipboard /> */}
      {/* <MobileClipboardFunction /> */}

      <div className="container mx-auto p-4 rounded-md">
        {/* Banner Ad */}
        {bannerAds.length > 0 && (
          <div className="w-full h-0 pb-[37.5%] bg-gray-200 overflow-hidden relative mb-6">
            <img
              src={bannerAds[currentAdIndex]?.imageUrl}
              alt={`Banner Ad ${currentAdIndex + 1}`}
              className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 rounded-md"
            />
          </div>
        )}

        {/* Top Navbar Icons */}
        <div className="relative flex justify-end mt-6">
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
            adminNotifications={adminNotifications}
          />
        )}

        {/* Main Body */}
        <div className="p-4 flex-1 overflow-auto">
           {/* Subscribed Courses */}
        <div className="mt-8">
          <h2 className="text-lg sm:text-2xl font-bold text-blue-950 mb-4">
            Your Subscribed Courses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CourseCard key={index} course={null} buttonLabel="" buttonLink="" />
                ))
              : userCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    buttonLabel="View"
                    buttonLink={`/course/${course._id}`}
                  />
                ))}
          </div>
        </div>
        {/* Unsubscribed Courses */}
        <div className="mt-6">
          <h2 className="text-lg sm:text-2xl font-bold text-blue-950 mb-4">
            Courses You Haven&apos;t Subscribed To
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CourseCard key={index} course={null} buttonLabel="" buttonLink="" />
                ))
              : unsubscribedCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    buttonLabel="Go to Course"
                    buttonLink={`/course/${course._id}`}
                  />
                ))}
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
