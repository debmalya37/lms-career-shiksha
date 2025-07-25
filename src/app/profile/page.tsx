"use client";
import IDCard from "@/components/IDCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

interface ProfileData {
  email: string;
  name: string;
  subscription: number;
  courses: Array<{ title: string }>; // Update to handle multiple courses
  profile?: {
    firstName: string;
    lastName: string;
  };
}

type CourseWithExpiry = {
  _id: string;
  title: string;
  // …
  daysLeft: number | null;
  expiryDate: string | null;
};


export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null); // Use ProfileData type
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile`, {
          method: "GET",
          credentials: "include", // Ensure cookies are sent
        });
        const profile = await res.json();
        if (!profile.error) {
          setProfileData(profile);
          const totalMarks = 100; // Replace with actual total marks
          const obtainedMarks = 20; // Replace with actual obtained marks
          setProgress((obtainedMarks / totalMarks) * 100);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    fetchProfile();
  }, []);

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md max-w-xl mt-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">User Profile</h1>
      <IDCard/>
      <form>
        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            title="firstN"
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={profileData.profile?.firstName || ""}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            title="lastN"
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={profileData.profile?.lastName || ""}
            readOnly
          />
        </div> */}
        {/* <Link className="bg-blue-950" href={"/u/purchases"}>Purchases</Link> */}
<br />
<div>
        <Link href={"/u/admissionforms"} className="bg-blue-950 text-gray-50 p-2 rounded-md m-2">Admissions</Link>
        <Link href={"/u/invoice"} className="bg-blue-950 text-gray-50 p-2 rounded-md m-2">Invoices</Link>
        <Link href={"/u/quizresults"} className="bg-blue-950 text-gray-50 p-2 rounded-md m-2">My performance</Link>
        </div>
        <br />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            title="email"
            type="email"
            className="border p-2 w-full rounded-md text-gray-950"
            value={profileData.email}
            readOnly
          />
              
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Courses</label>
          <ul className="border p-2 rounded-md text-gray-950 list-disc pl-5 bg-gray-50">
            {profileData.courses && profileData.courses.length > 0 ? (
              profileData.courses.map((course, index) => (
                <li key={index} className="text-gray-800">
                  {course.title}
                </li>
              ))
            ) : (
              <li>No courses assigned</li>
            )}
          </ul>
        </div>
        {/* inside your return, under Courses list: */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Courses &amp; Time Left</label>
  <ul className="space-y-2">
    {profileData.courses.map((c: any) => (
      <li key={c._id} className="p-4 bg-gray-50 rounded-md flex justify-between items-center">
        <div>
          <p className="font-semibold">{c.title}</p>
          {c.daysLeft !== null ? (
            c.daysLeft > 0 
              ? <p className="text-sm text-green-700">{c.daysLeft} days left</p> 
              
              : <p className="text-sm text-red-600">Expired on {new Date(c.expiryDate!).toLocaleDateString()}</p>
              
          ) : (
            <p className="text-sm text-gray-500">No expiry</p>
          )}

        </div>

        {/* optional: show a mini progress bar or badge */}
      </li>
    ))}
  </ul>
  
</div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subscription (Days)</label>
          <input
            title="subscription"
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={profileData.subscription || 0}
            readOnly
          />
        </div>
        <div className="mt-8 text-gray-950">
          <h2 className="text-lg font-semibold">Progress</h2>
          <div className="h-4 bg-gray-200 rounded-full">
            {/* <div
              className="bg-green-600 h-full rounded-full"
              style={{ width: `${progress}%` }}
            ></div> */}
          </div>
          {/* <p className="text-sm">{progress.toFixed(2)}% Completed</p> */}
        </div>
      </form>
      <div className="relative mt-8">
      <Link href="/profile/delete" className=" text-red-100 bg-red-800 rounded-md p-3">Delete Account</Link>
      </div>
    </div>
    
  );
}
