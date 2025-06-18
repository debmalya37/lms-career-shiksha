// src/app/course/[courseId]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import ReactPlayer from 'react-player';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import IntroVideoPlayer from "@/components/IntroVideoPlayer";
import { isRunningInStandaloneMode } from "@/lib/utils";

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
  introVideo?: string;
  discountedPrice: number; // New field
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
  const [promoCode, setPromoCode] = useState("");
const [promoMsg, setPromoMsg] = useState<string|null>(null);
const [finalPrice, setFinalPrice] = useState<number>(0);
const [showIntro, setShowIntro] = useState(false);

const router = useRouter();


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

  function toYouTubeEmbed(url: string) {
    const m = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/
    );
    return m ? `https://www.youtube.com/embed/${m[1]}?controls=0&modestbranding=1&rel=0` : url;
  }
  
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

  

  // Promo code application
  // after fetching course:
// after you fetch course:
useEffect(() => {
  if (course) {
    setFinalPrice(course.discountedPrice);
    setPromoCode("");
    setPromoMsg(null);
  }
}, [course]);


// apply handler
const applyPromo = async () => {
  if (!promoCode) return;
  try {
    const res = await axios.post("/api/promocodes/apply", {
      code: promoCode,
      courseId: course!._id
    });
    setFinalPrice(res.data.finalPrice);
    setPromoMsg(`Applied! New price: ₹${res.data.finalPrice.toFixed(2)}`);
  } catch (err: any) {
    setPromoMsg(err.response?.data?.error || "Invalid code");
  }
};


// enroll for free course
const handleEnrollFree = useCallback(async () => {
     if (!course) return;
     setPayLoading(true);
     try {
       await axios.post("/api/enroll", { courseId: course._id });
       setPurchased(true);
       // navigate to course content
       router.push(`/courses/${course._id}`);
     } catch (err) {
       console.error("Enroll error:", err);
       alert("Could not enroll. Please try again.");
     } finally {
       setPayLoading(false);
     }
   }, [course, router]);


// payment
const handlePurchase = useCallback(async () => {
  if (!course) return;
  setPayLoading(true);
  try {
    const { data } = await axios.post<{ redirectUrl?: string; redirect?: string }  & InitiatePaymentResponse>(
      "/api/initiatePayment",
      { amount: course.isFree ? 0 : finalPrice, courseId: course._id },
      { headers: { "Content-Type": "application/json" } }
    );
   // Try all possible fields:
   const redirect =
   data.redirectUrl ??
   data.redirect ??
   data.data?.instrumentResponse?.redirectInfo?.url;

   const intentUrl = `intent://upi/pay?pa=xxx@upi&pn=Career%20Shiksha&mc=xxxx&tid=xxxx&tr=xxxx&tn=Course%20Payment&am=999.00&cu=INR#Intent;scheme=upi;package=com.phonepe.app;end`;

if (isRunningInStandaloneMode()) {
  window.location.href = intentUrl;
} else {
  window.location.href = redirect; // Normal redirection
}

 // inside handlePurchase()
if (redirect) {
  // open PhonePe in external browser window
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
}, [course, finalPrice]);



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
            {/* <span className="inline-flex items-center px-2 py-1 bg-blue-600 rounded-full text-xs">
              <ClockIcon className="w-4 h-4 mr-1" />{" "}
              {new Date(course.createdAt).toLocaleDateString()}
            </span> */}
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

          {/* Intro Video Section */}
          <section className="pr-4">
            <h2 className="text-xl font-semibold mb-2">Course Introduction</h2>
            {course.introVideo ? (
              <IntroVideoPlayer url={course.introVideo} />
            ) : (
              <p className="text-gray-500">No intro video available.</p>
            )}
          </section>

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
          <div className="p-6 bg-white rounded-lg shadow border-2 border-blue-950">
          
              {/* Intro‐video / Thumbnail */}
              {/* Intro‐video / Thumbnail */}
<div className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
  <img
    src={course.courseImg || "/default-course.png"}
    alt="Course thumbnail"
    className="w-full h-40 object-cover rounded-lg"
  />
</div>


              
            {/* Price / Free Section */}
<div className="flex flex-col mt-3 space-y-4 p-4 border-2 border-blue-600 rounded-lg shadow-lg relative bg-gradient-to-tr from-blue-50 via-white to-blue-100">
  {course.isFree ? (
    <div className="flex items-center space-x-2">
      {/* Strike-through original price */}
      <span className="text-gray-500 line-through text-lg">
        ₹{course.price.toFixed(2)}
      </span>
      {/* FREE sticker */}
      <span className="text-4xl font-extrabold text-white bg-green-600 px-3 py-1 rounded-full">
        FREE
      </span>
    </div>
  ) : (
    <>
      {/* Offer Badge */}
      {course.price > course.discountedPrice && (
        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
          🔥 {Math.round(((course.price - finalPrice) / course.price) * 100)}% OFF
        </div>
      )}

      {/* Original Price */}
      {course.price > course.discountedPrice && (
        <span className="text-gray-500 line-through text-lg">
          ₹{course.price.toFixed(2)}
        </span>
      )}

      {/* Final / Discounted Price */}
      <div className="flex items-center space-x-2">
        <span className="text-4xl font-extrabold text-green-600">
          ₹{(finalPrice ?? course.discountedPrice).toFixed(2)}
        </span>
        <span className="text-sm font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
          Limited Time Deal
        </span>
      </div>

      {/* Promo-code Input */}
      <div className="flex space-x-2 mt-2">
        <input
          type="text"
          placeholder="Enter Promo Code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          className="border-2 border-gray-300 focus:border-blue-500 p-2 rounded w-full transition"
        />
        <button
          onClick={applyPromo}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition"
        >
          Apply
        </button>
      </div>

      {promoMsg && (
        <p className="text-sm text-yellow-700 font-semibold mt-1">
          {promoMsg}
        </p>
      )}
    </>
  )}
</div>




            {/* Purchase button */}

            {/* ← UPDATED: Instead of directly enrolling/purchasing, navigate to AdmissionForm */}
            <button
              onClick={course.isFree ? handleEnrollFree : handlePurchase}
              disabled={purchased || payLoading}
              className={`mt-4 w-full py-3 rounded-lg font-semibold transition ${
                purchased
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {purchased
                ? "Go to course"
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
         
        </aside>
      </div>
    </motion.main>
  );
}
