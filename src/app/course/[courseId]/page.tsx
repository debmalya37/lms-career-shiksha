// src/app/course/[courseId]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

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
  price: number;
  isFree: boolean;
}


// --- PhonePe Initiation types ---
interface InitiatePaymentRequest {
  amount: number;     // in rupees
  courseId: string;
}

interface PhonePeRedirectInfo {
  url: string;
  method?: string;
}

interface InstrumentResponse {
  type: string;
  redirectInfo: PhonePeRedirectInfo;
}

interface InitiatePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    instrumentResponse: InstrumentResponse;
  };
}
// ----------------------------------

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // fetch course + profile
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get<{ course: Course }>(
          `/api/course/${courseId}`
        );
        setCourse(res.data.course);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) fetchCourse();
  }, [courseId]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get<{ courses: Course[] }>(`/api/profile`);
        
        setPurchased(
          Array.isArray(res.data.courses) &&
            res.data.courses.some((c) => c._id === courseId)
        );
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }
    fetchProfile();
  }, [courseId]);

  // payment
  const handlePurchase = useCallback(async () => {
    if (!course) return;
    setPayLoading(true);
    try {
      const { data } = await axios.post<{ redirectUrl?: string; redirect?: string }  & InitiatePaymentResponse>(
        "/api/initiatePayment",
        { amount: course.isFree ? 0 : course.price, courseId: course._id },
        { headers: { "Content-Type": "application/json" } }
      );
     // Try all possible fields:
     const redirect =
     data.redirectUrl ??
     data.redirect ??
     data.data?.instrumentResponse?.redirectInfo?.url;

   if (redirect) {
     window.location.href = redirect;
   } else {
     console.error("No redirect URL in response:", data);
     alert("Could not initiate payment. Please try again.");
   }
 } catch (err: any) {
   console.error("Payment initiation error:", err.response?.data || err.message);
   alert("Error initiating payment. Please try again.");
 } finally {
   setPayLoading(false);
 }
}, [course]);
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <ClockIcon className="w-16 h-16 text-gray-400 animate-spin" />
      </div>
    );
  if (!course)
    return (
      <div className="p-8 text-center text-red-600">
        Course not found.
      </div>
    );

  return (
    <motion.main
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero */}
      <div
        className="relative h-64 md:h-96 bg-blue-950 overflow-hidden aspect-video object-cover bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: course.courseImg
            ? `url(${course.courseImg})`
            : undefined,
          
          
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-16 text-white">
          <h1 className="text-2xl md:text-4xl font-bold drop-shadow">
            {course.title}
          </h1>
          <p className="mt-2 text-sm md:text-base max-w-2xl drop-shadow">
            {course.description}
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="inline-flex items-center px-2 py-1 bg-blue-600 rounded-full text-xs">
              <ClockIcon className="w-4 h-4 mr-1" />{" "}
              {new Date(course.createdAt).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-green-600 rounded-full text-xs">
              <UserGroupIcon className="w-4 h-4 mr-1" />{" "}
              {course.subjects.length} Topics
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-16 py-12 grid gap-8 md:grid-cols-3">
        {/* Left column */}
        <div className="md:col-span-2 space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-2">What you’ll learn</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {course.subjects.map((s) => (
                <li
                  key={s._id}
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span>{s.name}</span>
                </li>
              ))}
            </ul>
          </section>
          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Course Description</h2>
            <p className="text-gray-700 leading-relaxed">{course.description}</p>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
          
              <img
                src={course.courseImg || "/default-course.png"}
                alt="Preview thumbnail"
                className="w-full h-40 object-cover"
              />
              
            {/* Price / Free */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">
                {course.isFree ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <>
                    <CurrencyRupeeIcon className="inline w-5 h-5" />
                    {(course.price ?? 0).toFixed(2)}

                  </>
                )}
              </span>
            </div>
            {/* Purchase button */}

            <button
              onClick={handlePurchase}
              disabled={purchased || payLoading}
              className={`mt-4 w-full py-3 rounded-lg font-semibold transition ${
                purchased
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {purchased
                ? "Enrolled"
                : payLoading
                ? "Processing..."
                : course.isFree
                ? "Enroll for free"
                : "Buy now"}
            </button>
            <Link href="/contact">
                <motion.button
                  className="bg-blue-950 text-white px-6  shadow-md hover:bg-blue-800  mt-4 w-full py-3 rounded-lg font-semibold transition"
                  whileHover={{ scale: 1.05 }}
                >
                  Contact Us
                </motion.button>
              </Link>
          </div>
          <div className="p-6 bg-white rounded-lg shadow text-gray-700 space-y-2">
            <h3 className="font-semibold">Course Details</h3>
            <p>
              <span className="font-medium">Duration:</span> Self‑paced
            </p>
            <p>
              <span className="font-medium">Lessons:</span>{" "}
              {course.subjects.length}
            </p>
            <p>
              {/* <span className="font-medium">Level:</span> Beginner */}
            </p>
          </div>
        </aside>
      </div>
    </motion.main>
  );
}
