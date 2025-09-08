'use client';

import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../public/image/logo.jpg'; // Adjust the path as needed
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

interface Course {
  _id: string;
  title: string;
  duration: number; // in days
}


export const AdmissionFormPreview = ({ admission }: { admission: Admission }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [course, setCourse] = useState<Course | null>(null);

  // 📡 Fetch course title
  useEffect(() => {
    // fetch both title and duration
    fetch(`/api/course/${admission.courseId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load course');
        return res.json();
      })
      .then(data => {
        // assuming API returns { course: { _id, title, duration, ... } }
        setCourse(data.course);
      })
      .catch(console.error);
  }, [admission.courseId]);
  
  
  // helper to format date
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

// compute expiry date
let expiry: string | null = null;
if (course) {
  const admDate = new Date(admission.createdAt);
  admDate.setDate(admDate.getDate() + course.duration || 1825);
  expiry = fmt(admDate.toISOString());
}

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

  // const fmt = (d: string) =>
  //   new Date(d).toLocaleDateString(undefined, {
  //     day: '2-digit',
  //     month: 'short',
  //     year: 'numeric',
  //   });

  return (
    <div className="p-6">
      <div
        ref={formRef}
        className="bg-white p-8 shadow-lg w-[794px] min-h-[1123px] mx-auto text-[14px] font-sans text-gray-800 space-y-6"
      >
        {/* HEADER GRID */}
        <div className="grid grid-cols-3 items-center gap-4 mb-8">
        {/* Row 1: Logo + Title (spanning all 3 columns) */}
        <div className="col-span-3 text-center">
          <img
            src={logo.src}
            alt="Civil Academy Logo"
            className="mx-auto w-24 h-24 object-cover rounded-full mb-2"
            style={{ border: '2px solid #1E40AF' }}
          />
          <h1 className="text-3xl font-bold text-blue-600">ADMISSION FORM</h1>
        </div>

        {/* Row 2: ID/Date (left) */}
        <div className="text-sm space-y-1">
          <p><strong>ID:</strong> {admission.transactionId}</p>
          <p><strong>Date:</strong> {fmt(admission.createdAt)}</p>
        </div>

        {/* Row 2: empty center column */}
        <div></div>

        {/* Row 2: Address/contact (right) */}
        <div className="text-right text-sm space-y-1">
          <p>A-79, Ganga Vatika</p>
          <p>Meerut, UP 250001</p>
          <p>Email: affordablecareersolutions@gmail.com</p>
        </div>
      </div>


        {/* Student Info */}
        <div>
          <h2 className="font-semibold text-lg border-b pb-1 mb-2">Student Details</h2>
          <div className="space-y-1">
            <p><strong>Name:</strong> {admission.name}</p>
            <p><strong>Father’s Name:</strong> {admission.fatherName}</p>
            {admission.email && <p><strong>Email:</strong> {admission.email}</p>}
            {admission.phone && <p><strong>Phone:</strong> {admission.phone}</p>}
            <p><strong>DOB:</strong> {fmt(admission.dob)}</p>
          </div>
        </div>

        {/* Address */}
        <div>
          <h2 className="font-semibold text-lg border-b pb-1 mb-2">Address</h2>
          <p>
            {admission.address1}, {admission.address2}, {admission.city ?? admission.state}, {admission.state}
          </p>
        </div>

        {/* Course */}
        <div>
          <h2 className="font-semibold text-lg border-b pb-1 mb-2">Course Enrolled</h2>
          {course
            ? (
              <div className="space-y-1">
                <p><strong>Course:</strong> {course.title}</p>
                <p><strong>Duration:</strong> {course.duration || 1825} days</p>
                <p><strong>Expiry Date:</strong> {expiry}</p>
              </div>
            )
            : <p>Loading course details…</p>
          }
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6 pt-6 border-t">
          This is a system-generated admission form. Please carry a valid ID to all sessions.
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
