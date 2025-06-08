"use client";

import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import Image from "next/image";
import logo from "../../public/image/logo.jpeg";

interface AdmissionData {
  name: string;
  fatherName: string;
  profileImageUrl: string;
  createdAt: string;
}

export default function IDCard() {
  const [data, setData] = useState<AdmissionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    fetch("/api/admission/me")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || res.statusText);
        return res.json();
      })
      .then((adm: AdmissionData) => setData(adm))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-indigo-900 to-black text-white text-center">
        <Image src={logo} alt="Logo" width={60} height={60} className="mb-4" />
        <div>
          <h2 className="text-2xl font-semibold mb-2">No ID Card Available</h2>
          <p className="text-gray-300 mb-4 max-w-md mx-auto">
            {error === "No admission found"
              ? "We couldn't find your admission details. If you’ve recently enrolled, please try again later or contact support."
              : error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 rounded-full shadow-md transition"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-4 text-center text-white">Loading ID card…</div>;
  }

  const issueDate = new Date(data.createdAt);
  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  const downloadDataPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40;
    let y = 60;

    // Page 1: Header & Profile Data
    doc.setFontSize(22);
    doc.text("Student ID Card Data", left, y);
    y += 30;

    doc.setFontSize(12);
    doc.text(`Name: ${data.name}`, left, y);
    y += 20;
    doc.text(`Father’s Name: ${data.fatherName}`, left, y);
    y += 20;
    doc.text(`Issue Date: ${fmt(issueDate)}`, left, y);
    y += 20;
    doc.text(`Expiry Date: ${fmt(expiryDate)}`, left, y);

    // Profile image
    if (data.profileImageUrl) {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = data.profileImageUrl;
      img.onload = () => {
        doc.addImage(img, "JPEG", 400, 60, 100, 100);
        doc.addPage();
        // Page 2: Terms & Conditions
        y = 60;
        doc.setFontSize(16);
        doc.text("Terms & Conditions", left, y);
        y += 25;
        doc.setFontSize(10);
        [
          "1. This ID card is non-transferable.",
          "2. Valid only for the enrolled course and duration.",
          "3. Carry at every class or session.",
          "4. Report loss immediately to administration.",
          "5. Use implies acceptance of all policies.",
        ].forEach((line) => {
          doc.text(line, left, y, { maxWidth: 500 });
          y += 18;
        });
        doc.save(`IDCard_${data.name.replace(/\s+/g, "_")}.pdf`);
      };
    } else {
      // No profile image
      doc.addPage();
      y = 60;
      doc.setFontSize(16);
      doc.text("Terms & Conditions", left, y);
      y += 25;
      doc.setFontSize(10);
      [
        "1. This ID card is non-transferable.",
        "2. Valid only for the enrolled course and duration.",
        "3. Carry at every class or session.",
        "4. Report loss immediately to administration.",
        "5. Use implies acceptance of all policies.",
      ].forEach((line) => {
        doc.text(line, left, y, { maxWidth: 500 });
        y += 18;
      });
      doc.save(`IDCard_${data.name.replace(/\s+/g, "_")}.pdf`);
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
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden">
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
                  <div className="relative">
                    <div className="absolute inset-0 bg-teal-400 rounded-lg blur-lg opacity-30"></div>
                    <img
                      src={data.profileImageUrl}
                      alt="Profile"
                      className="relative w-24 h-24 object-cover rounded-xl border-4 border-white shadow-md"
                    />
                  </div>
                </div>
                <div className="w-2/3 flex flex-col justify-center px-3 text-white text-sm">
                  <h2 className="text-lg font-bold mb-2">STUDENT CARD</h2>
                  <p>
                    <span className="opacity-75">Name: </span>
                    <span>{data.name}</span>
                  </p>
                  <p>
                    <span className="opacity-75">Father’s: </span>
                    <span>{data.fatherName}</span>
                  </p>
                  <div className="flex justify-between text-xs mt-2">
                    <div>
                      <span className="opacity-75">Issue:</span>
                      <br />
                      <span>{fmt(issueDate)}</span>
                    </div>
                    <div>
                      <span className="opacity-75">Expiry:</span>
                      <br />
                      <span>{fmt(expiryDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
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
