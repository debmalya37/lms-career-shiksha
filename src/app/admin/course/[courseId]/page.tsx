"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

interface Subject {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  courseImg?: string;
  subjects: Subject[];
  createdAt: string;
  introVideoUrl?: string; // If you store a video URL
}

export default function CourseDetailsPage() {
  const { courseId } = useParams(); // dynamic param from URL: /course/[courseId]
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get(`/api/course/${courseId}`);
        if (res.data?.course) {
          setCourse(res.data.course);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-800">Loading...</div>;
  }

  if (!course) {
    return <div className="p-8 text-center text-red-600">Course not found.</div>;
  }

  return (
    <main className="min-h-screen bg-white text-white">
      {/* Top Bar */}
      <div className="bg-[#1F1A3D] text-white px-4 py-2 text-xl font-bold">
        Civil Academy
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Two-Column Section */}
        <div className="flex flex-col md:flex-row bg-blue-950 text-white rounded shadow p-4">
          {/* Left Column: Course Image */}
          <div className="md:w-1/2 w-full h-64 bg-blue-950 border-white border-2 shadow-md shadow-white rounded-md flex items-center justify-center overflow-hidden">
            {course.courseImg ? (
              <img
                src={course.courseImg}
                alt={`${course.title} Thumbnail`}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-500">No Image</span>
            )}
          </div>

          {/* Right Column: Course Description */}
          <div className="md:w-1/2 w-full mt-4 md:mt-0 md:ml-6">
            <h2 className="text-2xl font-bold mb-2">Course Description</h2>
            <p className="text-gray-100 leading-relaxed">
              {course.description.slice(0, 300)}...
            </p>
          </div>
        </div>

        {/* Introduction to the Course */}
        <div className="mt-6 bg-blue-950 rounded shadow p-4">
          <h3 className="text-xl font-bold mb-2">Introduction to the Course</h3>
          <p className="text-gray-100 leading-relaxed mb-3">
            {/* Full description or partial text */}
            {course.description}
          </p>
          {/* Example bullet points */}
          {/* <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Bullet point 1 about the course</li>
            <li>Bullet point 2 about the course</li>
            <li>Bullet point 3 about the course</li>
          </ul> */}
          <p className="text-gray-100">
            <strong>Subjects:</strong>{" "}
            {course.subjects?.map((subj) => subj.name).join(", ") || "N/A"}
          </p>

          {/* Buttons at the bottom */}
          <div className="flex space-x-4">
            <Link href="/contact">
              <button className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-950 transition-colors">
                Contact Us
              </button>
            </Link>
            <button className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-950 transition-colors">
              Purchase
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
