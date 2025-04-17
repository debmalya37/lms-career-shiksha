"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import Link from "next/link";
import { motion } from "framer-motion";

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

  // Fetch course details
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get<{ course: Course }>(`/api/course/${courseId}`);
        setCourse(res.data.course);
      } catch (err) {
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) fetchCourse();
  }, [courseId]);

  // Check if already purchased
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get<{ courses: Course[] }>(`/api/profile`);
        const owns = Array.isArray(res.data.courses)
          && res.data.courses.some(c => c._id === courseId);
        setPurchased(owns);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }
    fetchProfile();
  }, [courseId]);

  // Purchase handler
  const handlePurchase = useCallback(async () => {
    if (!course) return;
    setPayLoading(true);
  
    try {
      const { data } = await axios.post<
        { redirectUrl?: string; redirect?: string } & InitiatePaymentResponse
      >(
        "/api/initiatePayment",
        { amount: 300, courseId: course._id },
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
  

  if (loading) {
    return <div className="p-8 text-center text-gray-800">Loading...</div>;
  }
  if (!course) {
    return <div className="p-8 text-center text-red-600">Course not found.</div>;
  }

  return (
    <motion.main
      className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Top Bar */}
      <motion.div
        className="bg-[#1F1A3D] text-white px-4 py-3 text-xl font-bold text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        Civil Academy
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg p-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          layout
        >
          {/* Left */}
          <div className="md:w-1/2 w-full flex flex-col">
            <motion.div
              className="h-64 bg-blue-950 border-white border-2 shadow-lg rounded-md flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {course.courseImg ? (
                <motion.img
                  src={course.courseImg}
                  alt={`${course.title} Thumbnail`}
                  className="w-full h-full object-contain rounded-md"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
            </motion.div>

            <motion.div
              className="mt-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200"
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-blue-900">
                Introduction to the Course
              </h3>
              <p className="text-gray-900">{course.description}</p>
            </motion.div>
          </div>

          {/* Right */}
          <div className="md:w-1/2 w-full md:pl-6 mt-4 md:mt-0 flex flex-col">
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-gray-950 leading-relaxed mt-2">
              <strong>Published on:</strong>{" "}
              {new Date(course.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <motion.div
              className="mt-6 bg-white rounded-lg shadow-lg p-6 border border-gray-200"
              whileHover={{ scale: 1.01 }}
            >
              <h4 className="text-lg font-semibold underline mb-3">
                Subjects Covered:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-900 text-lg pl-4">
                {course.subjects.map((subj) => (
                  <motion.li
                    key={subj._id}
                    className="flex items-center gap-2"
                    whileHover={{ x: 5, color: "#2563eb" }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-blue-600 font-semibold">✔</span> {subj.name}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="flex space-x-4 mt-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/contact">
                <motion.button
                  className="bg-blue-950 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-800 transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  Contact Us
                </motion.button>
              </Link>
              {purchased ? (
                <Link href={`/courses/${course._id}`}>
                  <motion.button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
                    whileHover={{ scale: 1.05 }}
                  >
                    Go to Course Content
                  </motion.button>
                </Link>
              ) : (
                <motion.button
                  onClick={handlePurchase}
                  disabled={payLoading}
                  className="bg-blue-900 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-950 transition-all disabled:opacity-50"
                  whileHover={payLoading ? {} : { scale: 1.05 }}
                >
                  {payLoading ? "Processing..." : "Purchase"}
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
