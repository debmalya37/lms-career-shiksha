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

  // Refs to the on‐screen card sides
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admission/me")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || res.statusText);
        return res.json();
      })
      .then((adm: AdmissionData) => setData(adm))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!data) return <div className="p-4">Loading ID card…</div>;

  const issueDate  = new Date(data.createdAt);
  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  /** 
   * Snapshot an element by cloning it into a hidden, un‐clipped container,
   * calling html2canvas on that clone, then cleaning up.
   */
  async function snapshotElement(el: HTMLDivElement): Promise<string> {
    // 1) Create an offscreen container
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

    // 2) Clone the node
    const clone = el.cloneNode(true) as HTMLElement;
    // Remove any transforms/clipping on the clone
    clone.style.transform = "none";
    clone.style.perspective = "none";
    clone.style.overflow = "visible";
    clone.style.position = "relative";
    clone.style.top = "0";
    clone.style.left = "0";

    wrapper.appendChild(clone);

    // 3) Use html2canvas on the wrapper (so all child styles apply)
    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: null,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });

    // 4) Clean up
    document.body.removeChild(wrapper);

    // 5) Return data URL
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex flex-col items-center justify-center p-6 space-y-4">
      <button
        // onClick={downloadPdf}
        className="bg-teal-400 hover:bg-teal-500 text-black font-semibold px-6 py-3 rounded-full shadow-xl transition"
      >
        📥 Download ID Card (2-Page) button coming soon
      </button>

      {/* Visible 3D Flip Card */}
      <div className="relative w-[420px] h-[260px] perspective">
        <div
          className={`relative w-full h-full transform-style preserve-3d transition-transform duration-700 ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 backface-hidden"
            ref={frontRef}
          >
            <div className="w-full h-full rounded-3xl shadow-2xl overflow-hidden border border-gray-700 
                            bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-800 to-indigo-900 
                            relative">
              <div className="absolute top-4 left-4">
                <Image src={logo} alt="Logo" width={40} height={40} />
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
                      className="relative w-28 h-28 object-cover rounded-xl border-4 border-white shadow-lg"
                    />
                  </div>
                </div>
                <div className="w-2/3 flex flex-col justify-center px-6 text-white">
                  <h2 className="font-sans text-xl font-extrabold tracking-wide mb-2">STUDENT CARD</h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="opacity-75">Name:</span>{" "}
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <div>
                      <span className="opacity-75">Father’s:</span>{" "}
                      <span className="font-medium">{data.fatherName}</span>
                    </div>
                    <div className="flex space-x-4">
                      <div>
                        <span className="opacity-75 text-xs">Issue:</span><br />
                        <span className="font-medium text-sm">{fmt(issueDate)}</span>
                      </div>
                      <div>
                        <span className="opacity-75 text-xs">Expiry:</span><br />
                        <span className="font-medium text-sm">{fmt(expiryDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 backface-hidden rotate-y-180"
            ref={backRef}
          >
            <div className="w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-gray-800 text-white p-6">
              <h3 className="text-lg font-semibold mb-2">Terms &amp; Conditions</h3>
              <ul className="text-xs space-y-1 list-disc list-inside opacity-80">
                <li>Non-transferable ID usage strictly for enrolled students.</li>
                <li>Carry this card at all academy sessions and exams.</li>
                <li>Return upon course completion or termination.</li>
                <li>Any tampering invalidates this card immediately.</li>
                <li>Possession implies acceptance of all academy policies.</li>
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
