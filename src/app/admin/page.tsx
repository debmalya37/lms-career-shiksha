"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ClipLoader from 'react-spinners/ClipLoader';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Fetch profile data from the API
        const profileRes = await axios.get(`/api/profile`);
        const profileData = profileRes.data;

        console.log("Profile Data:", profileData); // Log the profile response

        // Define allowed emails
        const allowedEmails = ['debmalyasen37@gmail.com', 'civilacademy.in@gmail.com', 'civilacademy98@gmail.com', 'civil1@hotmail.com', 'civil2@hotmail.com', 'Tech@kryptaroid.com','civil3@hotmail.com','civil4@hotmail.com'];

        // Check if the profile email is in the allowed list
        if (profileData?.email && allowedEmails.includes(profileData.email)) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return <div><ClipLoader /></div>;
  }

  if (!isAdmin) {
    return <div className="text-center text-red-600 mt-10">You are not an admin</div>;
  }

  return (
    <div className="min-h-screen bg-gray-200 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Link href="/admin/live-classes" className="bg-blue-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Live Classes</h2>
        </Link>
        <Link href="/admin/tutorials" className="bg-green-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Tutorials</h2>
        </Link>
        <Link href="/admin/notes" className="bg-purple-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Notes</h2>
        </Link>
        <Link href="/admin/userCreation" className="bg-yellow-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">User Creation</h2>
        </Link>
        <Link href="/admin/ebook" className="bg-orange-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage eBooks</h2>
        </Link>
        <Link href="/admin/quiz" className="bg-red-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage quiz/test-series</h2>
        </Link>
        {/* <Link href="/admin/query" className="bg-indigo-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Queries</h2>
        </Link> */}
        <Link href="/admin/topics" className="bg-teal-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Topics</h2>
        </Link>
        <Link href="/admin/subjects" className="bg-gray-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Subjects</h2>
        </Link>
        <Link href="/admin/course" className="bg-red-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Courses</h2>
        </Link>
        <Link href="/admin/notifications" className="bg-red-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Notifications</h2>
        </Link>
        <Link href="/admin/bannerAds" className="bg-red-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Ads Banner</h2>
        </Link>
      </div>
    </div>
  );
};

export default AdminPanel;
