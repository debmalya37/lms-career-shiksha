"use client";

import React, { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import logo from "../../public/image/logo.jpeg";

interface AdmissionData {
  name: string;
  profileImageUrl?: string;
  createdAt: string;
}

interface ProfileData {
  name: string;
  email: string;
  subscription: number;   // number of days of subscription
}

export default function IDCard() {
  const [admission, setAdmission] = useState<AdmissionData | null>(null);
  const [profile, setProfile]     = useState<ProfileData | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [flipped, setFlipped]     = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef  = useRef<HTMLDivElement>(null);

  // 1) Try to fetch admission; fallback to profile
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
              name:         prof.name,
              email:        prof.email,
              subscription: prof.subscription, // days
            });
          }
        } else {
          setError(err.message);
        }
      });
  }, []);

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
  const name       = admission?.name || profile!.name;
  const email      = profile?.email;
  const profileImg = admission?.profileImageUrl;
  const issueDate  = admission
    ? new Date(admission.createdAt)
    : new Date();
  // expiry = issue + subscription days
  const expiryDate = profile
    ? new Date(issueDate.getTime() + profile.subscription * 24 * 60 * 60 * 1000)
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
  const downloadDataPdf = async () => {
    const doc = new jsPDF({ unit: "px", format: "a4" });
    let y = 60;
    doc.setFontSize(22).text("Student ID Card Data", 40, y);
    y += 30;
    doc.setFontSize(12).text(`Name: ${name}`, 40, y);
    y += 20;
    if (email) {
      doc.text(`Email: ${email}`, 40, y);
      y += 20;
    }
    doc.text(`Issue Date: ${fmt(issueDate)}`, 40, y);
    y += 20;
    doc.text(`Expiry Date: ${fmt(expiryDate)}`, 40, y);

    if (profileImg) {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src         = profileImg;
      img.onload      = () => {
        doc.addImage(img, "JPEG", 400, 60, 100, 100);
        doc.addPage();
        doc.setFontSize(16).text("Terms & Conditions", 40, 60);
        doc.setFontSize(10);
        let ty = 90;
        [
          "1. This ID card is non-transferable.",
          "2. Valid only for the enrolled course and duration.",
          "3. Carry at every class or session.",
          "4. Report loss immediately to administration.",
          "5. Use implies acceptance of all policies.",
        ].forEach((line) => {
          doc.text(line, 40, ty);
          ty += 20;
        });
        doc.save(`IDCard_${name.replace(/\s+/g, "_")}.pdf`);
      };
    } else {
      doc.addPage();
      doc.setFontSize(16).text("Terms & Conditions", 40, 60);
      doc.setFontSize(10);
      let ty = 90;
      [
        "1. This ID card is non-transferable.",
        "2. Valid only for the enrolled course and duration.",
        "3. Carry at every class or session.",
        "4. Report loss immediately to administration.",
        "5. Use implies acceptance of all policies.",
      ].forEach((line) => {
        doc.text(line, 40, ty);
        ty += 20;
      });
      doc.save(`IDCard_${name.replace(/\s+/g, "_")}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex flex-col items-center justify-center p-6 space-y-4">
      <button
        onClick={downloadDataPdf}
        className="bg-teal-400 hover:bg-teal-500 text-black font-semibold px-6 py-2 rounded-full shadow-xl transition"
      >
        📥 Download Data‐Only PDF
      </button>

      {/* 3D Flip Card */}
      <div className="relative w-full max-w-sm aspect-[420/260] perspective">
        <div
          className={`relative w-full h-full transform-style preserve-3d transition-transform duration-700 ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden" ref={frontRef}>
            <div className="w-full h-full rounded-xl shadow-xl overflow-hidden border border-gray-700 bg-gradient-to-br from-indigo-800 to-indigo-900 relative">
              <div className="absolute top-3 left-3">
                <Image src={logo} alt="Logo" width={35} height={35} />
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
                        src={profileImg}
                        alt="Profile"
                        className="relative w-24 h-24 object-cover rounded-xl border-4 border-white shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">
                      No Photo
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
