"use client";

import React, { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

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
    if (error === "No admission found") {
      return (
        <div className="min-h-screen flex items-center justify-center flex-col text-center p-8 text-white bg-gradient-to-br from-gray-900 via-indigo-900 to-black">
          <Image src={logo} alt="Logo" width={60} height={60} className="mb-4" />
          <h2 className="text-xl font-semibold mb-2">No ID Card Available</h2>
          <p className="text-sm text-gray-300 max-w-md">
            This is because either you never took Admission in any course or we couldn&apos;t find your admission details. Please try again later or contact the academy.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-full shadow-md transition"
          >
            🔄 Retry
          </button>
        </div>
      );
    }

    return (
      <div className="text-red-400 bg-red-900/30 p-6 rounded-lg border border-red-600 max-w-md mx-auto mt-10 text-center">
        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-white">Loading ID card…</div>;

  const issueDate = new Date(data.createdAt);
  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  async function snapshotElement(el: HTMLDivElement): Promise<string> {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      position: "fixed",
      top: "-9999px",
      left: "-9999px",
      overflow: "visible",
      width: `${el.offsetWidth}px`,
      height: `${el.offsetHeight}px`,
      pointerEvents: "none",
    });
    document.body.appendChild(wrapper);

    const clone = el.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      transform: "none",
      perspective: "none",
      overflow: "visible",
      position: "relative",
      top: "0",
      left: "0",
    });
    wrapper.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: null,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });

    document.body.removeChild(wrapper);
    return canvas.toDataURL("image/png");
  }

  const downloadPdf = async () => {
    const pdf = new jsPDF({ unit: "px", format: [420, 260] });

    if (frontRef.current) {
      const frontImg = await snapshotElement(frontRef.current);
      pdf.addImage(frontImg, "PNG", 0, 0, 420, 260);
    }

    pdf.addPage([420, 260], "portrait");

    if (backRef.current) {
      const backImg = await snapshotElement(backRef.current);
      pdf.addImage(backImg, "PNG", 0, 0, 420, 260);
    }

    pdf.save(`IDCard_${data.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
      <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex flex-col items-center justify-center py-10 space-y-4">
    
      <button
        className="bg-teal-400 hover:bg-teal-500 text-black font-semibold px-6 py-2 rounded-full shadow-xl transition text-sm sm:text-base"
      >
        📥 Download ID Card (Coming Soon)
      </button>

      {/* Flip Card Container */}
      <div className="relative w-full max-w-sm aspect-[420/260] perspective">
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden"
            ref={frontRef}
          >
            <div className="w-full h-full rounded-xl shadow-xl overflow-hidden border border-gray-700 bg-gradient-to-br from-indigo-800 to-indigo-900 relative">
              <div className="absolute top-3 left-3">
                <Image src={logo} alt="Logo" width={35} height={35} />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 w-1/3 h-1 bg-teal-300/50 animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/2 w-1/2 h-1 bg-pink-400/50 animate-pulse-slow" />
              </div>
              <div className="absolute inset-0 bg-white/5 animate-shimmer" />
              <div className="relative z-10 flex h-full">
                <div className="w-1/3 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-teal-400 rounded-lg blur-lg opacity-30" />
                    <img
                      src={data.profileImageUrl}
                      alt="Profile"
                      className="relative w-24 h-24 object-cover rounded-xl border-4 border-white shadow-md"
                    />
                  </div>
                </div>
                <div className="w-2/3 flex flex-col justify-center px-3 text-white text-sm">
                  <h2 className="text-lg font-bold tracking-wide mb-2">STUDENT CARD</h2>
                  <div className="space-y-1">
                    <div>
                      <span className="opacity-75">Name:</span>{" "}
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <div>
                      <span className="opacity-75">Father’s:</span>{" "}
                      <span className="font-medium">{data.fatherName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="opacity-75">Issue:</span><br />
                        <span>{fmt(issueDate)}</span>
                      </div>
                      <div>
                        <span className="opacity-75">Expiry:</span><br />
                        <span>{fmt(expiryDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden rotate-y-180"
            ref={backRef}
          >
            <div className="w-full h-full rounded-xl shadow-xl overflow-hidden bg-gray-800 text-white p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold mb-2">Terms &amp; Conditions</h3>
              <ul className="text-xs space-y-1 list-disc list-inside opacity-80">
                <li>Non-transferable ID for enrolled students only.</li>
                <li>Carry this card at all sessions and exams.</li>
                <li>Return after course completion or termination.</li>
                <li>Tampering voids the ID immediately.</li>
                <li>Use of card implies policy acceptance.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="text-teal-400 hover:text-teal-300 transition text-sm"
      >
        {flipped ? "← Show Front" : "Show Terms →"}
      </button>
    </div>
  );
}
