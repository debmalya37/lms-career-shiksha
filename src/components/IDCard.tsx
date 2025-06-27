"use client";

import React, { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import logo from "../../public/image/logo.jpeg";
import { IDCardPreview } from "./IDCardPreview";

import dayjs from "dayjs";

interface AdmissionData {
  _id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  createdAt: string;
  gender: string;
  phone: string;
  studentid: string;
  course: string[]; // course names
}

interface ProfileData {
  _id?: string;
  profileImageUrl?: string;
  name: string;
  email: string;
  subscription: number;
  courses: Array<{ title: string }>; 
}


export default function IDCard() {
  const [admission, setAdmission] = useState<AdmissionData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [userProfile, setUserprofile] = useState<ProfileData | null>(null);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admission/me")
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || res.statusText);
        }
        return res.json();
      })
      .then((adm: AdmissionData) => setAdmission(adm))
      .catch(async (err) => {
        if (err.message === "No admission found") {
          const prof = await fetch("/api/profile").then((r) => r.json());
          if (prof.error) {
            setError(prof.error);
          } else {
            setProfile({
              name: prof.name,
              email: prof.email,
              subscription: prof.subscription,
              courses: prof.courses || [],
              _id: prof._id,

            });
          }
        } else {
          setError(err.message);
        }
      });
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile`, {
          method: "GET",
          credentials: "include", // Ensure cookies are sent
        });
        const profile = await res.json();
        if (!profile.error) {
          setUserprofile(profile);
          setProfile({
            name: profile.name,
            email: profile.email,
            subscription: profile.subscription,
            courses: profile.courses || [],
           
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    fetchProfile();
  }, []);

  // snapshot helper
  async function snapshotElement(el: HTMLDivElement) {
    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });
    return canvas.toDataURL("image/png");
  }

  const downloadCardAsPdf = async () => {
    if (!containerRef.current) return;
    try {
      const imgData = await snapshotElement(containerRef.current);
      // Create a4 jsPDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // draw image full page
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      // filename
      const id = admission?._id || profile?._id || "idcard";
      pdf.save(`IDCard_${id}.pdf`);
    } catch (e) {
      console.error("Error generating PDF", e);
      alert("Failed to download ID card. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-indigo-900 to-black text-white text-center">
        <Image src={logo} alt="Logo" width={60} height={60} className="mb-4" />
        <div>
          <h2 className="text-2xl font-semibold mb-2">Oops!</h2>
          <p className="text-gray-300 max-w-md mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  if (!admission && !profile) {
    return <div className="p-4 text-center text-white">Loading ID Card…</div>;
  }

  // Source data
  const name       = admission?.name || profile?.name || "Student";
const email      = profile?.email || admission?.email || "—";
const profileImg = admission?.profileImageUrl || profile?.profileImageUrl;
const imgUrl     = admission?.profileImageUrl || profile?.profileImageUrl;
// const courses    = admission?.course?.length ? admission.course : profile?.courses?.map(c => c.title) || [];

  const issueDate  = admission
    ? new Date(admission.createdAt)
    : new Date();
  // expiry = issue + subscription days
  const expiryDate = profile
    ? new Date(issueDate.getTime() + (userProfile?.subscription || 0) * 24 * 60 * 60 * 1000)
    : new Date(issueDate.setFullYear(issueDate.getFullYear() + 1));
   

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    });

  // snapshot helper
  async function snapshot(el: HTMLDivElement) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      position: "fixed",
      top:      "-9999px",
      left:     "-9999px",
      overflow: "visible",
      width:    `${el.offsetWidth}px`,
      height:   `${el.offsetHeight}px`,
    });
    document.body.appendChild(wrapper);

    const clone = el.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      transform: "none",
      position:  "relative",
      overflow:  "visible",
      top:       "0",
      left:      "0",
    });
    wrapper.appendChild(clone);

    const canvas = await html2canvas(clone, { scale: 2, backgroundColor: null });
    document.body.removeChild(wrapper);
    return canvas.toDataURL("image/png");
  }

  // Data‐only PDF
  const downloadIDCardPdf = () => {
    const id = admission?._id || profile?._id;
    if (!id) return;
  
    const link = document.createElement("a");
    link.href = `/api/idcard/pdf/${id}`;
    link.target = "_blank";
    link.click();
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex flex-col items-center justify-center p-6 space-y-4">
      {/* <button
        onClick={downloadCardAsPdf}
        className="bg-teal-400 hover:bg-teal-500 text-black font-semibold px-6 py-2 rounded-full shadow-xl transition"
      >
        📥 Download Data‐Only PDF
      </button> */}
      <button
        onClick={() => setPreviewOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
      >
        Preview ID Card
      </button>

      {previewOpen && (
        <IDCardPreview
          name={name}
          email={email}
          profileImageUrl={logo.src}
          issueDate={issueDate}
          expiryDate={expiryDate}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* 3D Flip Card */}
      <div ref={containerRef} className="relative w-full max-w-sm aspect-[420/260] perspective">
        <div
          className={`relative w-full h-full transform-style preserve-3d transition-transform duration-700 ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden" ref={frontRef}>
            <div className="w-full h-full rounded-xl shadow-xl overflow-hidden border border-gray-700 bg-gradient-to-br from-indigo-800 to-indigo-900 relative">
              <div className="absolute top-3 left-3">
                {/* <Image src={logo} alt="Logo" width={35} height={35} /> */}
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 w-1/3 h-1 bg-teal-300/50 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/2 w-1/2 h-1 bg-pink-400/50 animate-pulse"></div>
              </div>
              <div className="absolute inset-0 bg-white/5 animate-pulse-slow"></div>
              <div className="relative z-10 flex h-full">
                <div className="w-1/3 flex items-center justify-center">
                  {profileImg ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-teal-400 rounded-lg blur-lg opacity-30"></div>
                      <img
                        src={logo.src}
                        alt="Profile"
                        className="relative w-24 h-24 object-cover rounded-xl border-4 border-white shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-teal-400 rounded-lg blur-lg opacity-30"></div>
                      <img
                        src={logo.src}
                        alt="Profile"
                        className="relative w-24 h-24 object-cover rounded-xl border-4 border-white shadow-md"
                      />
                    </div>
                  )}
                </div>
                <div className="w-2/3 flex flex-col justify-center px-3 text-white text-sm">
                  <h2 className="text-lg font-bold mb-2">STUDENT CARD</h2>
                  <p>
                    <span className="opacity-75">Name: </span>
                    {name}
                  </p>
                  {email && (
                    <p className="mt-1">
                      <span className="opacity-75">Email: </span>
                      {email}
                    </p>
                  )}
                  {/* {courses.length > 0 && (
  <p>
    <span className="opacity-75">Course:</span> {courses.join(", ")}
  </p>
)} */}


                  <div className="flex justify-between text-xs mt-2">
                    <div>
                      <span className="opacity-75">Issue:</span>
                      <br />
                      {fmt(issueDate)}
                    </div>
                    <div>
                      <span className="opacity-75">Expiry:</span>
                      <br />
                      {fmt(expiryDate as unknown as Date)}
                    </div>
                  </div> 
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180" ref={backRef}>
            <div className="w-full h-full rounded-xl shadow-xl overflow-hidden bg-gray-800 text-white p-4">
              <h3 className="text-base font-semibold mb-2">Terms & Conditions</h3>
              <ul className="text-xs list-disc list-inside space-y-1">
                <li>Non-transferable ID for enrolled students only.</li>
                <li>Carry this card at all sessions and exams.</li>
                <li>Return after course completion or termination.</li>
                <li>Tampering voids the ID immediately.</li>
                <li>Use implies policy acceptance.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="text-teal-400 hover:text-teal-200 transition"
      >
        {flipped ? "← Show Front" : "Show Terms →"}
      </button>
    </div>
  );
}
