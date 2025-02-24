"use client";

import DisableRightClickAndClipboard from "@/components/DisableRightClick";
import MobileClipboardFunction from "@/components/MobileClipboard";
import TutorialVideoPlayer from "@/components/TutorialVideoPlayer";

import { useState, useEffect, useRef } from "react";

interface Tutorial {
  _id: string;
  title: string;
  url: string;
  description: string;
}

interface Course {
  _id: string;
  title: string;
  subjects: { _id: string; name: string }[];
}

interface Profile {
  phoneNo: number;
  email: string;
  name: string;
  courses: Course[];
  subscription: number;
}
// Add this type declaration at the top of your file

declare global {
  interface Window {
    YT: typeof YT | undefined;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface CustomPlayerVars extends YT.PlayerVars {
  fs?: number;
  iv_load_policy?: number;
  playsinline?: number;
}

interface VideoPlayerProps {
  url: string;
  modalView?: boolean;
}

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[] | null>(null);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(
    null
  );

  useEffect(() => {
    async function fetchProfileAndTutorials() {
      try {
        const res = await fetch(`/api/profile`, {
          method: "GET",
          credentials: "include",
        });
        const profile = await res.json();

        // Log the email and phone number to the console
        if (profile.email && profile.phoneNo) {
          console.log("Email:", profile.email);
          console.log("Phone:", profile.phoneNo);
        }

        if (!profile.error && profile.courses?.length > 0) {
          setProfileData(profile);

          // Extract all subject IDs from the user's courses
          const subjectIds = profile.courses.flatMap((course: { subjects: any[]; }) =>
            course.subjects.map((subject) => subject._id)
          );

          if (subjectIds.length > 0) {
            const tutorialRes = await fetch(
              `/api/tutorials/specific?subjectIds=${subjectIds.join(",")}`
            );
            const fetchedTutorials = await tutorialRes.json();
            setTutorials(Array.isArray(fetchedTutorials) ? fetchedTutorials : null);
          } else {
            setTutorials(null);
          }
        } else {
          setTutorials(null);
        }
      } catch (error) {
        console.error("Error fetching profile or tutorials:", error);
        setTutorials(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndTutorials();
  }, []);

  // Disable copy to clipboard globally
  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      event.preventDefault(); // Prevent copying
      alert("Copying to clipboard is disabled.");
    };

    document.addEventListener("copy", handleCopy);

    // Cleanup event listener when the component is unmounted
    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  // useEffect(() => {
  //   // Interval for showing email and phone no
  //   const interval = setInterval(() => {
  //     const emailPhoneElement = document.getElementById("email-phone-text");
  //     if (emailPhoneElement) {
  //       emailPhoneElement.classList.add("visible");
  //       setTimeout(() => {
  //         emailPhoneElement.classList.remove("visible");
  //       }, 2000); // Hide after 2 seconds
  //     }
  //   }, 1000); // Trigger every 10 seconds

  //   return () => clearInterval(interval); // Clean up the interval on unmount
  // }, []);




  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please sign in to view tutorials.</p>
      </div>
    );
  }

  if (!tutorials || tutorials.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No tutorials available for your subscribed courses.</p>
      </div>
    );
  }

  
  // Function to convert YouTube URL to nocookie version
  const convertToNoCookieUrl = (url: string) => {
    if (url.includes("youtube.com")) {
      return url.replace("youtube.com", "youtube-nocookie.com");
    }
    return url; // If it's not a YouTube URL, return as is
  };

  return (
    <div className="container mx-auto py-8 pl-5 pr-5 bg-gradient-to-b from-gray-900 to-blue-800 w-[100vw] h-[100vh] tutorialP">
      {/* <DisableRightClickAndClipboard/> */}
      {/* <MobileClipboardFunction/> */}
      <h1 className="text-3xl font-bold text-gray-200 mb-6 text-center">Tutorials</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutorials?.map((video) => (
      <div
        key={video._id}
        className="bg-white rounded-lg shadow-md p-4 text-black cursor-pointer"
        onClick={() => setSelectedTutorial(video)}
      >
        <h3 className="text-xl font-semibold mb-4">{video.title}</h3>
        
        
        <p className="text-gray-600">{video.description}</p>
      </div>
    ))}
      </div>

      {/* Modal */}
      {/* Update the modal section in the return statement */}
{selectedTutorial && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
    <div className="bg-gradient-to-b from-gray-950 to-blue-950 rounded-lg p-1 shadow-lg w-[90vw] md:w-[80vw] lg:w-[60vw] h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white text-center">{selectedTutorial.title}</h2>
        <button
          className="text-red-600 text-xl font-bold"
          onClick={() => setSelectedTutorial(null)}
        >
          ✕
        </button>
      </div>
      
      {/* Email overlay
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <p className="text-white text-lg font-bold bg-black/50 p-2 rounded">
          Email: {profileData.email}
        </p>
      </div> */}

      {/* Video Player Container */}
      <div className="relative flex-1 m-0 mr-0 ml-0">
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bottom-64">
        <p className="text-white text-lg font-bold bg-black/50 p-2 rounded opacity-25">
          Email: {profileData.email}
        </p>
      </div>
        <TutorialVideoPlayer url={selectedTutorial.url} />
         {/* Email overlay */}
      </div>
      
      <p className="mt-4 text-gray-200">{selectedTutorial.description}</p>
    </div>
  </div>
)}
    </div>
  );
}
