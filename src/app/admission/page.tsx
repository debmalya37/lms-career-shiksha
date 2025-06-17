"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

export default function AdmissionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId   = searchParams.get("courseId")   || "";
  const courseName = searchParams.get("courseName") || "";

  const [formData, setFormData] = useState({
    photoOfCandidate:  null as File | null,
    aadhaarFront:      null as File | null,
    aadhaarBack:       null as File | null,
    name:              "",
    fatherName:        "",
    phone:             "",
    email:             "",
    address1:          "",
    address2:          "",
    state:             "",
    city:              "",
    dob:               "",
    courseId,
  });

  // Minimal sample of cities per state; expand as needed
  const citiesByState: Record<string,string[]> = {
    "West Bengal": ["Kolkata","Howrah","Durgapur"],
    "Maharashtra": ["Mumbai","Pune","Nagpur"],
    // …etc
  };
  
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((f) => ({ ...f, [field]: file }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Step 1: Prepare admission form data
    const payload = new FormData();
    payload.append("courseId", formData.courseId);
    payload.append("name", formData.name);
    payload.append("fatherName", formData.fatherName);
    payload.append("phone", formData.phone);
    payload.append("email", formData.email);
    payload.append("address1", formData.address1);
    payload.append("address2", formData.address2);
    payload.append("state", formData.state);
    payload.append("city", formData.city);
    payload.append("dob", formData.dob);
  
    if (formData.photoOfCandidate)
      payload.append("photoOfCandidate", formData.photoOfCandidate);
    if (formData.aadhaarFront)
      payload.append("aadhaarFront", formData.aadhaarFront);
    if (formData.aadhaarBack)
      payload.append("aadhaarBack", formData.aadhaarBack);
  
    try {
      // Step 2: Submit admission
      const transactionId = searchParams.get("transactionId") || "";
const admissionRes = await fetch(`/api/admission?transactionId=${transactionId}`, {

        method: "POST",
        body: payload,
      });
      const admissionData = await admissionRes.json();
      console.log("admissionData:", admissionData);
      const admissionFormId = admissionData.admissionId;

      if(admissionData.ok) {
        alert("Admission submitted successfully!");
        console.log("Admission successful:", admissionData);
      }
      if (!admissionRes.ok) {
        alert(admissionData.error || "Admission submission failed");
        return;
      }
      
      console.log("admissionData:", admissionData);
      // Step 3: Generate invoice after admission
      const invoiceRes = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admissionFormId,
          studentName: admissionData.name,
          phone: admissionData.phone,
          email: admissionData.email,
          courseId: admissionData.courseId,
          transactionId: searchParams.get("transactionId") || "",
        }),

        
      });
  
      const invoiceData = await invoiceRes.json();
  
      if (!invoiceRes.ok) {
        alert(invoiceData.error || "Invoice generation failed");
        return;
      }
  
      // Step 4: All successful — redirect
      router.push("/");
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Something went wrong");
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

            {/* Course Name */}
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
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 py-2 px-3 text-gray-700"
              />
            </div>

            {/* Photo of Candidate */}
            <div className="col-span-full">
              <label
                htmlFor="photoOfCandidate"
                className="block text-sm font-medium text-gray-700"
              >
                Photo of Candidate
              </label>
              <input
                type="file"
                id="photoOfCandidate"
                name="photoOfCandidate"
                accept="image/*"
                onChange={handleFileChange("photoOfCandidate")}
                className="mt-1 block w-full text-sm text-gray-600"
              />
            </div>

            {/* Aadhaar Front */}
            <div>
              <label
                htmlFor="aadhaarFront"
                className="block text-sm font-medium text-gray-700"
              >
                Aadhaar Card (Front)
              </label>
              <input
                type="file"
                id="aadhaarFront"
                name="aadhaarFront"
                accept="image/*"
                onChange={handleFileChange("aadhaarFront")}
                required
                className="mt-1 block w-full text-sm text-gray-600"
              />
            </div>

            {/* Aadhaar Back */}
            <div>
              <label
                htmlFor="aadhaarBack"
                className="block text-sm font-medium text-gray-700"
              >
                Aadhaar Card (Back)
              </label>
              <input
                type="file"
                id="aadhaarBack"
                name="aadhaarBack"
                accept="image/*"
                onChange={handleFileChange("aadhaarBack")}
                required
                className="mt-1 block w-full text-sm text-gray-600"
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
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* Father’s Name */}
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
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
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
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
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
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* DOB */}
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
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
              {formData.dob && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {format(new Date(formData.dob), "MMMM d, yyyy")}
                </p>
              )}
            </div>

            {/* Address 1 */}
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
                value={formData.address1}
                onChange={handleChange}
                required
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* Address 2 */}
            <div className="col-span-full">
              <label
                htmlFor="address2"
                className="block text-sm font-medium text-gray-700"
              >
                Address Line 2 (optional)
              </label>
              <textarea
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* State */}
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
                // onChange={(e) => {
                //   handleChange(e);
                  // // reset city when state changes
                  // setFormData((f) => ({ ...f, city: "" }));
                // }}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
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

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={!formData.state}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 bg-white"
              >
                
                {/* {formData.state &&
                  citiesByState[formData.state].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))} */}
              </input>
            </div>

            {/* Submit */}
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
