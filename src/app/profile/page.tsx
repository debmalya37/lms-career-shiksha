"use client";
import { useEffect, useState } from 'react';

interface ProfileData {
  email: string;
  name: string;
  subscription: number;
  course?: {
    title: string;
  };
  profile?: {
    firstName: string;
    lastName: string;
  };
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null); // Use ProfileData type
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile', {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent
        });
        const profile = await res.json();
        if (!profile.error) {
          setProfileData(profile);
          const totalMarks = 100; // Replace with actual total marks
          const obtainedMarks = 70; // Replace with actual obtained marks
          setProgress((obtainedMarks / totalMarks) * 100);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    fetchProfile();
  }, []);

  if (!profileData) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md max-w-xl mt-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">User Profile</h1>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            title="firstN"
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={profileData.profile?.firstName || ''}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            title="lastN"
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={profileData.profile?.lastName || ''}
            readOnly
          />
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
          <input
            title="course"
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={profileData.course?.title || 'No course assigned'}
            readOnly
          />
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
            <div
              className="bg-green-600 h-full rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm">{progress.toFixed(2)}% Completed</p>
        </div>
      </form>
    </div>
  );
}
