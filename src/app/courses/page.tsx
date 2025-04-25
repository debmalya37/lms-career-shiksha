"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor?: string;
  courseImg?: string;
  createdAt: string;
  subjects: { name: string }[];  // assume populated
}

interface UserProfile {
  courses: Course[];
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserCourses() {
      try {
        const profileRes = await axios.get<UserProfile>("/api/profile", { withCredentials: true });
        setCourses(profileRes.data.courses || []);
      } catch (err) {
        console.error("Error fetching user courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-50 mb-8 text-center">My Courses</h1>

        {courses.length === 0 ? (
          <p className="text-center text-gray-500 py-20">
            You are not enrolled in any courses yet.
          </p>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map(course => (
              <motion.div
                key={course._id}
                className="group bg-white rounded-xl overflow-hidden shadow-lg border border-transparent hover:border-gradient-to-br hover:from-blue-300 hover:to-purple-300 transition-all duration-300 flex flex-col"
                whileHover={{ scale: 1.03 }}
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  {course.courseImg ? (
                    <img
                      src={course.courseImg}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h2 className="absolute bottom-2 left-2 text-white text-lg font-semibold drop-shadow-md line-clamp-1">
                    {course.title}
                  </h2>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 flex-1 line-clamp-3">{course.description}</p>

                  {/* Info badges */}
                  <div className="mt-4 flex items-center space-x-4 text-gray-500 text-xs">
                    <span className="flex items-center space-x-1">
                      <BookOpenIcon className="w-4 h-4" />
                      <span>{course.subjects.length} Subjects</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <Link href={`/courses/${course._id}`}>
                    <span className="mt-4 inline-block text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      View Course
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
