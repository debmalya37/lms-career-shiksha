'use client';

import React, { useEffect, useState } from "react";
// import { pdf } from '@react-pdf/renderer';
import { AdmissionDocument } from "@/components/AdmissionDocument";
import { AdmissionFormPreview } from "@/components/AdmissionFormPreview";
import Image from "next/image";
import logo from "../../../../public/image/logo.jpeg";

interface Admission {
  _id: string;
  courseTitle: string;
  courseId: string;
  profileImageUrl: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  aadhaarNumber: string;
  name: string;
  fatherName: string;
  dob: string;
  address1: string;
  address2: string;
  state: string;
  city?: string;
  transactionId: string;
  createdAt: string;
  email?: string;
  phone?: string;
}

export default function UserAdmissionListPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewAdmission, setPreviewAdmission] = useState<Admission | null>(null);

  useEffect(() => {
    fetch("/api/u/admissions/me?all=true")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: Admission[]) => setAdmissions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  //   const res = await fetch(url);
  //   const blob = await res.blob();

  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => resolve(reader.result as string);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob);
  //   });
  // };

  // const handleDownload = async (adm: Admission) => {
  //   setBusyId(adm._id);
  //   try {
  //     const { pdf } = await import('@react-pdf/renderer');
  //     const [profileBase64, frontBase64, backBase64] = await Promise.all([
  //       adm.profileImageUrl ? getBase64ImageFromUrl(adm.profileImageUrl) : null,
  //       adm.aadhaarFrontUrl ? getBase64ImageFromUrl(adm.aadhaarFrontUrl) : null,
  //       adm.aadhaarBackUrl ? getBase64ImageFromUrl(adm.aadhaarBackUrl) : null,
  //     ]);

  //     const enrichedAdmission = {
  //       ...adm,
  //       profileImageUrl: profileBase64 || "",
  //       aadhaarFrontUrl: frontBase64 || "",
  //       aadhaarBackUrl: backBase64 || "",
  //     };

  //     const blob = await pdf(<AdmissionDocument admission={enrichedAdmission} />).toBlob();

  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `Admission_${adm._id}.pdf`;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to generate PDF");
  //   } finally {
  //     setBusyId(null);
  //   }
  // };

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (admissions.length === 0)
    return <div className="p-8 text-center text-gray-600">No admissions yet.</div>;

  return (
    <>
      <div className="p-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {admissions.map((adm) => (
          <div
            key={adm._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-indigo-800 to-indigo-600 flex items-center space-x-3">
              <Image src={logo} alt="Civil Academy" width={40} height={40} />
              <h2 className="text-white font-bold text-lg">Career Shiksha</h2>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-gray-700">{adm.courseTitle}</h3>
              <div className="flex space-x-3">
                <img
                  src={adm.profileImageUrl}
                  alt="Profile"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {adm.name}</p>
                <p><strong>Father’s Name:</strong> {adm.fatherName}</p>
                <p><strong>DOB:</strong> {new Date(adm.dob).toLocaleDateString()}</p>
                <p><strong>Aadhaar #:</strong> {adm.aadhaarNumber}</p>
                <p><strong>Address:</strong> {adm.address1}, {adm.address2}, {adm.state}</p>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                {/* <button
                  onClick={() => handleDownload(adm)}
                  disabled={busyId === adm._id}
                  className={`w-full py-2 rounded ${
                    busyId === adm._id
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {busyId === adm._id ? 'Generating…' : 'Download Admission PDF'}
                </button> */}
                <button
                  onClick={() => setPreviewAdmission(adm)}
                  className="w-full py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Preview */}
      {previewAdmission && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg overflow-auto max-h-[90vh] max-w-full p-4 relative">
            <button
              onClick={() => setPreviewAdmission(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl font-bold"
            >
              &times;
            </button>
            <AdmissionFormPreview admission={previewAdmission} />
          </div>
        </div>
      )}
    </>
  );
}
