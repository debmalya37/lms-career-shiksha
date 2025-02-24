"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

// Define the structure of a course
interface Course {
  _id: string;
  title: string;
  description: string;
  subjects: { name: string }[] | string[]; // Handle both populated and non-populated subjects
  courseImg?: string;
  createdAt: string;
  isHidden?: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  subscription: number;
  courses: Course[]; // Array of user courses
}

export default function CoursesPage() {
  const [userCourses, setUserCourses] = useState<Course[]>([]); // Store all user courses
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUserCourses() {
      try {
        // Fetch user profile
        const profileRes = await axios.get(`/api/profile`, { withCredentials: true });
        const profileData: UserProfile = profileRes.data;
        console.log("User Profile Data:", profileData);

        // Set user courses
        if (profileData?.courses?.length) {
          setUserCourses(profileData.courses); // Assign courses from API
        }
      } catch (error) {
        console.error('Error fetching user courses:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserCourses();
  }, []);

  return (
    <div className="container mx-auto py-8 px-5 text-white min-h-screen bg-slate-950">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">My Courses</h1>

      {isLoading ? (
        <p>Loading courses...</p>
      ) : userCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="p-4 flex flex-col flex-1 justify-between">
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
      ) : (
        <p>No courses found for your profile.</p>
      )}
    </div>
  );
}
