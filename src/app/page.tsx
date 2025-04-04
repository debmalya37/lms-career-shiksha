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

  // Fetch user profile, courses, notifications, etc.
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
      } catch (error) {
        console.error("Error fetching data:", error);
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

  // Reusable Course Card
  const CourseCard = ({
    course,
    buttonLabel,
    buttonLink,
  }: {
    course: Course;
    buttonLabel: string;
    buttonLink: string;
  }) => {
    return (
      <div className="flex items-center bg-blue-900 rounded-lg shadow-lg overflow-hidden w-full max-w-3xl h-auto p-4 hover:shadow-xl transition-shadow">
        {/* Left side: Image */}
        <div className="w-24 h-24 bg-blue-900 flex items-center justify-center rounded-md overflow-hidden flex-shrink-0">
          {course.courseImg ? (
            <img
              src={course.courseImg}
              alt={`${course.title} Thumbnail`}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-500">No Image</span>
          )}
        </div>
        {/* Center: Title + Description */}
        <div className="flex-1 px-4 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold text-gray-100">{course.title}</h3>
          <p className="text-sm text-gray-200 line-clamp-2">{course.description}</p>
        </div>
        {/* Right side: Button */}
        <div>
          <Link href={buttonLink}>
            <button className="bg-blue-200 text-blue-950 px-4 py-2 rounded-full hover:bg-blue-950 hover:text-blue-100 transition-colors">
              {buttonLabel}
            </button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <main className="bg-[#0B0220] min-h-screen text-white">
      <DisableRightClickAndClipboard />
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
          {userCourses.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-lg sm:text-2xl font-bold text-green-700 mb-4">
                Your Subscribed Courses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userCourses.map((course: Course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    buttonLabel="View"
                    buttonLink={`/courses/${course._id}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm sm:text-base">
              You have no active subscriptions.
            </p>
          )}
        </div>

        {/* Unsubscribed Courses */}
        <div className="mt-6">
          <h2 className="text-lg sm:text-2xl font-bold text-green-700 mb-4">
            Courses You Haven&apos;t Subscribed To
          </h2>
          {unsubscribedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unsubscribedCourses.map((course: Course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  buttonLabel="Contact Us"
                  buttonLink={`/contact`}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-sm sm:text-base">
              Looks like you&apos;ve subscribed to all available courses!
            </p>
          )}
        </div>
        </div>
      </div>
    </main>
  );
}
