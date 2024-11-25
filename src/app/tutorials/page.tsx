"use client";

import { useState, useEffect } from "react";

interface Tutorial {
  _id: string;
  title: string;
  url: string;
  description: string;
}

interface Profile {
  email: string;
  name: string;
  course: { _id: string; title: string } | null;
  subscription: number;
}

interface Subject {
  _id: string;
  name: string;
}

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileAndTutorials() {
      try {
        const res = await fetch(`https://civilacademyapp.com/api/profile`, {
          method: "GET",
          credentials: "include",
        });
        const profile = await res.json();

        if (!profile.error && profile.course) {
          setProfileData(profile);

          console.log("Profile course:", profile.course);

          // Extract subject IDs directly from the profile
          const subjectIds = profile.course.subjects;

          if (subjectIds && subjectIds.length > 0) {
            // Fetch tutorials using the subject IDs
            const tutorialRes = await fetch(
              `https://civilacademyapp.com/api/tutorials/specific?subjectIds=${subjectIds.join(",")}`
            );
            const fetchedTutorials = await tutorialRes.json();

            console.log("Tutorials fetched:", fetchedTutorials);
            setTutorials(fetchedTutorials);
          } else {
            console.log("No subjects found for the course.");
          }
        } else {
          console.error("Profile data error or no course found.");
        }
      } catch (error) {
        console.error("Error fetching profile or tutorials:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndTutorials();
  }, []);
  

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

  if (tutorials.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No tutorials available for your subscribed course.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 pl-5 pr-5 bg-yellow-100 w-[100vw] h-[100vh]">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tutorials</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((video) => (
          <div key={video._id} className="bg-white rounded-lg shadow-md p-4 text-black">
            <h3 className="text-xl font-semibold mb-4">{video.title}</h3>
            <iframe
              title={video.title}
              className="w-full h-48"
              src={video.url}
              sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
              allowFullScreen
            />
            <p className="text-gray-600">{video.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
