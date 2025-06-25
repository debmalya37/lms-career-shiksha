'use client';

import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../public/image/logo.jpeg'; // Adjust the path as needed
import Image from 'next/image';
interface Admission {
  name: string;
  fatherName: string;
  dob: string;
  aadhaarNumber: string;
  address1: string;
  address2: string;
  state: string;
  city?: string;
  courseId: string;
  transactionId: string;
  createdAt: string;
  profileImageUrl: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  email?: string;
  phone?: string;
}

export const AdmissionFormPreview = ({ admission }: { admission: Admission }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [courseTitle, setCourseTitle] = useState('');

  // 📡 Fetch course title
  useEffect(() => {
    const fetchCourseTitle = async () => {
      try {
        const res = await fetch(`/api/course/${admission.courseId}`);
        console.log('Fetching course title for ID:', admission.courseId);
  
        if (!res.ok) throw new Error('Failed to fetch course title');
  
        const data = await res.json(); // ✅ Only call this once
        console.log("Fetched data:", data);
  
        if (data?.course?.title) {
          setCourseTitle(data.course.title); // ✅ Use `title`, not `name`
        }
      } catch (err) {
        console.error('Failed to fetch course title:', err);
      }
    };
  
    fetchCourseTitle();
  }, [admission.courseId]);
  
  

  const downloadPDF = async () => {
    if (!formRef.current) return;

    const canvas = await html2canvas(formRef.current, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Admission_${admission.transactionId}.pdf`);
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="p-6">
      <div
        ref={formRef}
        className="bg-white p-8 shadow-lg w-[794px] min-h-[1123px] mx-auto text-[14px] font-sans text-gray-800 space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">ADMISSION FORM</h1>
            <div className="flex items-center gap-2">
  <Image
    src={logo} // 🔁 Update this to the actual path of your logo
    alt="Career Shiksha Logo"
    className="object-contain w-28 h-28 border mt-2"
  />
  <p className="text-base font-semibold text-gray-800">Career Shiksha</p>
</div>
            <p className="text-sm">A‑79, Ganga Vatika, Meerut, UP 250001</p>
            <p className="text-sm">Email: affordablecareersolutions@gmail.com</p>
          </div>
          <div className="text-right text-sm space-y-1">
            <p><strong>ID:</strong> {admission.transactionId}</p>
            <p><strong>Date:</strong> {fmt(admission.createdAt)}</p>
            {/* <img
              src={admission.profileImageUrl}
              alt="Profile"
              className="w-28 h-28 object-cover border mt-2"
            /> */}
          </div>
        </div>

        {/* Student Info */}
        <div>
          <h2 className="font-semibold text-lg border-b pb-1 mb-2">Student Details</h2>
          <div className="space-y-1">
            <p><strong>Name:</strong> {admission.name}</p>
            <p><strong>Father&apos;s Name:</strong> {admission.fatherName}</p>
            {admission.email && <p><strong>Email:</strong> {admission.email}</p>}
            {admission.phone && <p><strong>Phone:</strong> {admission.phone}</p>}
            <p><strong>DOB:</strong> {fmt(admission.dob)}</p>
            <p><strong>Aadhaar #:</strong> {admission.aadhaarNumber}</p>
          </div>
        </div>

        {/* Address */}
        <div>
          <h2 className="font-semibold text-lg border-b pb-1 mb-2">Address</h2>
          <p>{admission.address1}, {admission.address2}, {admission.city ?? admission.state}, {admission.state}</p>
        </div>

        {/* Course Info */}
        <div>
          <h2 className="font-semibold text-lg border-b pb-1 mb-2">Course Enrolled</h2>
          <p>{courseTitle || 'Loading course name...'}</p>
        </div>

        {/* Documents */}
        {/* Documents */}
<div>
  <h2 className="font-semibold text-lg border-b pb-1 mb-4">Documents</h2>
  <div className="flex flex-row gap-x-12">
    {admission.aadhaarFrontUrl && (
      <div>
        <p className="mb-2"><strong>Aadhaar Front:</strong></p>
        <img
          src={admission.aadhaarFrontUrl}
          alt="Aadhaar Front"
          className="w-[300px] border"
        />
      </div>
    )}
    {admission.aadhaarBackUrl && (
      <div>
        <p className="mb-2"><strong>Aadhaar Back:</strong></p>
        <img
          src={admission.aadhaarBackUrl}
          alt="Aadhaar Back"
          className="w-[300px] border"
        />
      </div>
    )}
  </div>
</div>


        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6 pt-6 border-t">
          This is a system-generated admission form. Carry your ID to all sessions.
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center mt-6">
        <button
          onClick={downloadPDF}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};
