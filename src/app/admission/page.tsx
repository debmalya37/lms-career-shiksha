"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

export default function AdmissionForm({ user }: { user: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const courseName = searchParams.get("courseName") || "";

  const [formData, setFormData] = useState({
    profileImage: null as File | null,
    aadhaarImage: null as File | null,
    aadhaarNumber: "",
    name: user?.name || "",
    fatherName: "",
    phone: user?.phone || "",
    email: user?.email || "",
    address1: "",
    address2: "",
    state: "",            // New field for State dropdown
    dob: "",              // YYYY-MM-DD format
    courseId,
  });

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, profileImage: file });
  };

  // inside AdmissionForm component:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const payload = new FormData();
  payload.append('courseId', formData.courseId);
  payload.append('name', formData.name);
  payload.append('fatherName', formData.fatherName);
  payload.append('phone', formData.phone);
  payload.append('email', formData.email);
  payload.append('address1', formData.address1);
  payload.append('address2', formData.address2);
  payload.append('state', formData.state);
  payload.append('dob', formData.dob);
  payload.append('aadhaarNumber', formData.aadhaarNumber);
  if (formData.profileImage) payload.append('profileImage', formData.profileImage);
  if (formData.aadhaarImage) payload.append('aadhaarImage', formData.aadhaarImage);

  try {
    const res = await fetch('/api/admission', {
      method: 'POST',
      body: payload,
    });
    const data = await res.json();
    if (res.ok) {
      // success → proceed to payment
      router.push(`/`);
    } else {
      alert(data.error || 'Submission failed');
    }
  } catch (err: any) {
    alert(err.message || 'Unknown error');
  }
};

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Student Admission Form
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Hidden Course ID */}
            <input type="hidden" name="courseId" value={courseId} />

            {/* Display Course Name (read-only) */}
            <div className="col-span-full">
              <label
                htmlFor="courseName"
                className="block text-sm font-medium text-gray-700"
              >
                Course Enrolling In
              </label>
              <input
                id="courseName"
                name="courseName"
                value={courseName}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 py-2 px-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Profile Image Upload */}
            <div className="col-span-full">
              <label
                htmlFor="profileImage"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Image
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Father's Name */}
            <div>
              <label
                htmlFor="fatherName"
                className="block text-sm font-medium text-gray-700"
              >
                Father’s Name
              </label>
              <input
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email ID
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

 {/* Date of Birth */}
 <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              {formData.dob && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected:{" "}
                  {format(new Date(formData.dob), "MMMM d, yyyy")}
                </p>
              )}
            </div>

              {/* Aadhaar Image Upload */}
<div className="col-span-full">
  <label htmlFor="aadhaarImage" className="block text-sm font-medium text-gray-700">
    Aadhaar Card Image
  </label>
  <input
    type="file"
    id="aadhaarImage"
    name="aadhaarImage"
    accept="image/*"
    onChange={e => setFormData(f => ({ ...f, aadhaarImage: e.target.files?.[0] || null }))}
    required
    className="mt-1 block w-full text-sm text-gray-600 file:rounded-md file:border-0 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
</div>

{/* Aadhaar Number */}
<div>
  <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700">
    Aadhaar Number
  </label>
  <input
    id="aadhaarNumber"
    name="aadhaarNumber"
    value={formData.aadhaarNumber}
    onChange={handleChange}
    required
    className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
  />
</div>

            {/* Residential Address */}
            <div className="col-span-full">
              <label
                htmlFor="address1"
                className="block text-sm font-medium text-gray-700"
              >
                Residential Address
              </label>
              <textarea
                id="address1"
                name="address1"
                placeholder="Address Line 1"
                value={formData.address1}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 mb-2"
                rows={2}
              />
              <textarea
                id="address2"
                name="address2"
                placeholder="Address Line 2"
                value={formData.address2}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 mb-2"
                rows={2}
              />
            </div>

            {/* State Dropdown */}
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700"
              >
                State
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="" disabled>
                  -- Select State --
                </option>
                {indianStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            

            {/* Submit Button */}
            <div className="col-span-full text-center">
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition"
              >
                SUBMIT TO ADMISSION
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
