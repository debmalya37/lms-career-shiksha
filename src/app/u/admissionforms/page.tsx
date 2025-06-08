"use client";

import React, { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import logo from "../../../../public/image/logo.jpeg";

interface Admission {
  _id: string;
  courseTitle: string;
  profileImageUrl: string;
  aadhaarImageUrl: string;
  aadhaarNumber: string;
  name: string;
  fatherName: string;
  dob: string;
  address1: string;
  address2: string;
  state: string;
  createdAt: string;
}

export default function UserAdmissionListPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch("/api/u/admissions/me?all=true")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: Admission[]) => setAdmissions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadPdf = async (id: string) => {
    const el = cardRefs.current[id];
    if (!el) return;

    // render off‐screen for crisp capture
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      position: "fixed",
      top: "-9999px",
      left: "-9999px",
      overflow: "visible",
      width: `${el.offsetWidth}px`,
      height: `${el.offsetHeight}px`,
    });
    document.body.appendChild(wrapper);

    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    wrapper.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#fff",
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
    document.body.removeChild(wrapper);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "px", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`AdmissionForm_${id}.pdf`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading your admissions…</div>;
  }
  if (!admissions.length) {
    return (
      <div className="p-8 text-center text-gray-600">
        You haven’t submitted any admission forms yet.
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {admissions.map((adm) => (
        <div key={adm._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div
            className="p-4 bg-gradient-to-r from-indigo-800 to-indigo-600 flex items-center space-x-3"
          >
            <Image src={logo} alt="Career Shiksha" width={40} height={40} />
            <h2 className="text-white font-bold text-lg">Career Shiksha</h2>
          </div>

          <div
            className="p-4 space-y-2"
            ref={(el) => {
              cardRefs.current[adm._id] = el;
            }}
          >
            <h3 className="font-semibold text-gray-700">{adm.courseTitle}</h3>

            <div className="flex space-x-3">
              <img
                src={adm.profileImageUrl}
                alt="Profile"
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <img
                src={adm.aadhaarImageUrl}
                alt="Aadhaar"
                className="w-16 h-16 object-cover rounded-lg border"
              />
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Name:</strong> {adm.name}</p>
              <p><strong>Father’s Name:</strong> {adm.fatherName}</p>
              <p><strong>DOB:</strong> {formatDate(adm.dob)}</p>
              <p><strong>Aadhaar #:</strong> {adm.aadhaarNumber}</p>
              <p>
                <strong>Address:</strong> {adm.address1}, {adm.address2}, {adm.state}
              </p>
            </div>

            <button
              onClick={() => downloadPdf(adm._id)}
              className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg transition"
            >
              Download PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to prettify YYYY-MM-DD
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
