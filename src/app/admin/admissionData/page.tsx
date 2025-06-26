// app/admin/admissionData/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

interface Admission {
  _id: string;
  userId: string;
  courseId: string;
  name: string;
  fatherName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  state: string;
  dob: string; // ISO string
  // profileImageUrl: string;
  // aadhaarImageUrl: string;
  // aadhaarNumber: string;
  createdAt: string;
}

export default function AdmissionDataPage() {
  const [list, setList] = useState<Admission[]>([]);
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  useEffect(() => {
    axios.get<Admission[]>("/api/admission").then((res) => {
      setList(res.data);
    });
  }, []);

  const openModal = (src: string) => setModalSrc(src);
  const closeModal = () => setModalSrc(null);

  const downloadPdf = async (ad: Admission) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = margin;

    doc.setFontSize(18).text("Admission Form", 210, y, { align: "center" });
    y += 30;
    doc.setFontSize(12);
    doc.text(`Name: ${ad.name}`, margin, y);
    doc.text(`Father’s Name: ${ad.fatherName}`, 300, y);
    y += 20;
    doc.text(`Email: ${ad.email}`, margin, y);
    doc.text(`Phone: ${ad.phone}`, 300, y);
    y += 20;
    // doc.text(`Aadhaar No: ${ad.aadhaarNumber}`, margin, y);
    doc.text(`DOB: ${new Date(ad.dob).toLocaleDateString()}`, 300, y);
    y += 20;
    doc.text(`Address: ${ad.address1}`, margin, y);
    y += 15;
    if (ad.address2) {
      doc.text(ad.address2, margin, y);
      y += 15;
    }
    doc.text(`State: ${ad.state}`, margin, y);
    y += 30;

    // Load and place profile image
    const loadImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload  = () => res(img);
        img.onerror = rej;
        img.src     = url;
      });

    // try {
    //   const profileImg = await loadImage(ad.profileImageUrl);
    //   doc.addImage(
    //     profileImg,
    //     "JPEG",
    //     margin,
    //     y,
    //     100,
    //     100
    //   );
    // } catch {
    //   /* skip if fails */
    // }

    // try {
    //   const aadhaarImg = await loadImage(ad.aadhaarImageUrl);
    //   doc.addImage(
    //     aadhaarImg,
    //     "JPEG",
    //     400,
    //     y,
    //     100,
    //     100
    //   );
    // } catch {
    //   /* skip */
    // }

    doc.save(`admission_${ad._id}.pdf`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admissions Data</h1>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Name",
                "Email",
                "Phone",
                "State",
                "DOB",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {list.map((ad) => (
              <tr key={ad._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{ad.name}</td>
                <td className="px-4 py-2 text-sm">{ad.email}</td>
                <td className="px-4 py-2 text-sm">{ad.phone}</td>
                <td className="px-4 py-2 text-sm">{ad.state}</td>
                <td className="px-4 py-2 text-sm">
                  {new Date(ad.dob).toLocaleDateString()}
                </td>
                {/* <td className="px-4 py-2">
                  <img
                    src={ad.profileImageUrl}
                    alt="profile"
                    className="h-12 w-12 object-cover rounded cursor-pointer"
                    onClick={() => openModal(ad.profileImageUrl)}
                  />
                </td>
                <td className="px-4 py-2">
                  <img
                    src={ad.aadhaarImageUrl}
                    alt="aadhaar"
                    className="h-12 w-12 object-cover rounded cursor-pointer"
                    onClick={() => openModal(ad.aadhaarImageUrl)}
                  />
                </td> */}
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => downloadPdf(ad)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg overflow-hidden shadow-lg max-w-[90vw] max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-1"
            >
              ✕
            </button>
            <img
              src={modalSrc}
              alt="preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
