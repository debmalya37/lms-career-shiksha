"use client";

import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import logo from "../../public/image/logo.jpeg";

interface PreviewProps {
  name: string;
  email?: string;
  profileImageUrl?: string;
  issueDate: Date;
  expiryDate: Date;
  onClose: () => void;
}

export function IDCardPreview({
  name,
  email,
  profileImageUrl,
  issueDate,
  expiryDate,
  onClose,
}: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const downloadPdf = async () => {
    if (!containerRef.current) return;

    const canvas = await html2canvas(containerRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      windowWidth: containerRef.current.scrollWidth,
      windowHeight: containerRef.current.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Image size based on page width, maintain aspect ratio
    const imgWidth = pageWidth - 80; // 40pt margin on left/right
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const x = 40; // center with margins
    const y = 40; // top margin

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(`IDCard_${name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">ID Card Preview</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            ✕
          </button>
        </div>

        {/* Card + Terms */}
        <div ref={containerRef} className="space-y-4">
          {/* Student ID Card */}
          <div
            className="
              w-full max-w-[500px]
              rounded-lg overflow-hidden border border-gray-300 shadow
            "
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Photo */}
              <div className="w-full md:w-1/3 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 p-4">
  <img
    src={logo.src}
    alt="Profile"
    width={96}
    height={96}
    style={{
      width: '96px',
      height: '96px',
      borderRadius: '50%',
      border: '4px solid white',
      objectFit: 'cover',
      backgroundColor: '#fff',
    }}
  />
</div>


              {/* Details */}
              <div className="w-full md:w-2/3 p-3 md:p-4 text-xs md:text-sm">
                <h3 className="font-bold mb-2">STUDENT CARD</h3>
                <p><strong>Name:</strong> {name}</p>
                {email && (
                  <p><strong>Email:</strong> {email}</p>
                )}
                <div className="mt-4 flex flex-col md:flex-row justify-between text-xs">
                  <div className="mb-2 md:mb-0">
                    <strong>Issue:</strong><br />{fmt(issueDate)}
                  </div>
                  <div>
                    <strong>Expiry:</strong><br />{fmt(expiryDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-gray-100 p-4 rounded-lg text-sm border border-gray-300 shadow">
            <h3 className="font-semibold mb-2">Terms & Conditions</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Non-transferable ID for enrolled students only.</li>
              <li>Carry this card at all sessions and exams.</li>
              <li>Return after course completion or termination.</li>
              <li>Tampering voids the ID immediately.</li>
              <li>Use implies policy acceptance.</li>
            </ul>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-end">
          <button
            onClick={downloadPdf}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
