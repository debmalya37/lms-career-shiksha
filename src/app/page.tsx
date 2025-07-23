"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BellIcon, UserIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationPopup from "@/components/NotificationPopup";
import DisableRightClickAndClipboard from "@/components/DisableRightClick";
import MobileClipboardFunction from "@/components/MobileClipboard";
import ProgressBar from "@/components/ProgressBar";
import SimpleProgressBar from "@/components/SimpleProgressBar";
// import MobileClipboardFunction from "@/components/MobileClipboard"; // If you still need it

// Define interfaces
interface Course {
  _id: string;
  title: string;
  description: string;
  courseImg?: string;
  subjects: { name: string }[] | string[];
  createdAt: string;
  isHidden?: boolean; // Ensure this property exists
  isFree?: boolean;
}
interface BannerAd {
  _id: string;
  imageUrl: string;
  link: string; // 👈 Add this line
}

interface UserProfile {
  userId: string;
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
  const [userId, setUserId] = useState<string | null>(null);
  // Check for session token and redirect if missing
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');

  // …fetching logic…

  // Helper for filtering by free/paid:
  const applyPriceFilter = (course: Course) => {
    if (priceFilter === 'All') return true;
    if (priceFilter === 'Free') return !!course.isFree;
    return !course.isFree;
  };

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await axios.get(`/api/session-status`, { withCredentials: true });
        if (!res.data.sessionActive) {
          router.push("/signup");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        router.push("/signup");
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
        const profileRes = await axios.get(`/api/profile`,{ withCredentials: true, });
        const profileData: UserProfile = profileRes.data;
        console.log("Profile Data:", profileData);
  
        if (profileData?.courses?.length) {
          setUserCourses(profileData.courses);
          setUserId(profileData.userId);
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
    }, 6000);
    return () => clearInterval(interval);
  }, [bannerAds]);

  // Inside your Home component
// Reusable Course Card

interface Course {
  _id: string;
  title: string;
  description: string;
  courseImg?: string;
  isFree?: boolean;
  isHidden?: boolean;
  /** progress added by /api/profile */
  progress?: {
      total: number;
      completed: number;
      percent: number;
    };
}

interface CourseCardProps {
  course: Course | null;
  buttonLabel: string;
  buttonLink: string;
}

 const  CourseCard = ({
  course,
  buttonLabel,
  buttonLink,
}: CourseCardProps) => {
  const isFree = !!course?.isFree;

  return (
    <div
      className="
        flex-shrink-0
        w-full sm:w-64
        bg-white
        rounded-xl
        shadow-lg
        hover:shadow-2xl
        transition
        transform hover:-translate-y-1
        flex flex-col
        mt-7
      "
    >
      {/* 16:9 Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden rounded-t-xl bg-gray-100">
        {course ? (
          <img
            src={course.courseImg || "/placeholder.jpg"}
            alt={course.title}
            className="object-cover w-full h-full transition-transform duration-300 transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 animate-pulse" />
        )}
        {isFree && (
          <span className="
            absolute top-2 left-2
            bg-green-600 text-white text-xs font-semibold
            uppercase px-2 py-0.5 rounded
          ">
            Free
          </span>
        )}
      </div>
      {/* progress bar */}
      {course?.progress && (
        <div className="p-4">
                  <SimpleProgressBar progress={course.progress.percent} />

        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course ? course.title : <div className="h-5 bg-gray-300 animate-pulse rounded w-3/4" />}
        </h3>
        <span className="text-sm text-gray-700 flex-1 mb-4 line-clamp-3">
          {course
            ? course.description.length > 100
              ? course.description.slice(0, 100) + "…"
              : course.description
            : <div className="h-4 bg-gray-300 animate-pulse rounded w-full mb-2" />}
        </span>
        <div className="flex items-center justify-end">
          {course ? (
            <Link href={buttonLink}>
              <span className="
                text-sm font-light p-2 bg-slate-300 rounded-md
                hover:bg-slate-100
                text-blue-600 hover:text-blue-800
                transition
              ">
                {buttonLabel} →
              </span>
            </Link>
          ) : (
            <div className="h-6 bg-gray-300 animate-pulse rounded w-16" />
          )}
        </div>
      </div>
    </div>
  );
}


  return (
    <main className="bg-white min-h-screen text-gray-800">
      <DisableRightClickAndClipboard />
      <MobileClipboardFunction />

      <div className="container mx-auto p-4 rounded-md">
        {/* Banner Ad */}
{bannerAds.length > 0 && (
  <a
    href={bannerAds[currentAdIndex]?.link}
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full relative overflow-hidden mb-0 rounded-md"
  >
    <div className="relative w-full pb-[37.5%] sm:pb-[80%] md:pb-[37.5%] bg-gray-200 rounded-md">
      <img
        src={bannerAds[currentAdIndex]?.imageUrl}
        alt={`Banner Ad ${currentAdIndex + 1}`}
        className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 rounded-md"
      />
    </div>
  </a>
)}

        {/* Main Body */}
        <div className="p-4 flex-1 overflow-auto">
           {/* Subscribed Courses */}
        <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">🎓 Continue Learning</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">

            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CourseCard key={index} course={null} buttonLabel="" buttonLink="" />
                ))
              : userCourses.filter(course => !course.isHidden).map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    buttonLabel="Go to Course"
                    buttonLink={`/courses/${course._id}`}
                  />
                ))}
          </div>
        </div>
        {/* ───── Price Filter Pills ───── */}
          <div className="flex flex-wrap gap-2 mb-6  justify-items-start ml-2">
            {(['All','Free','Paid'] as const).map(option => (
              <button
                key={option}
                onClick={() => setPriceFilter(option)}
                className={`
                  px-3 py-1 rounded-full  text-sm
                  ${priceFilter === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        {/* Unsubscribed Courses */}
        <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">📚 Courses You Might Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CourseCard key={index} course={null} buttonLabel="" buttonLink="" />
                ))
              : unsubscribedCourses.filter(course => !course.isHidden && applyPriceFilter(course)).map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    buttonLabel="View"
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
