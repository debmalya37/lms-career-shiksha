"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import axios from "axios";

interface AdmissionState {
  courseId:         string;
  photoOfCandidate: File | null;
  aadhaarFront:     File | null;
  aadhaarBack:      File | null;
  name:             string;
  fatherName:       string;
  phone:            string;
  email:            string;
  address1:         string;
  address2:         string;
  pincode:          string;
  state:            string;
  city:             string;
  dob:              string;
}

export default function AdmissionForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const courseId     = searchParams.get("courseId")   || "";
  const courseName   = searchParams.get("courseName") || "";
  const transactionId= searchParams.get("transactionId") || "";

  const [form, setForm] = useState<AdmissionState>({
    courseId,
    photoOfCandidate: null,
    aadhaarFront:     null,
    aadhaarBack:      null,
    name:             "",
    fatherName:       "",
    phone:            "",
    email:            "",
    address1:         "",
    address2:         "",
    pincode:          "",
    state:            "",
    city:             "",
    dob:              "",
  });

  // 1️⃣ On mount: fetch pre‑admission and prefill
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/pre-admission");
        const all = data as any[];
        // match by courseId && email if known
        const me = all.find(item =>
          item.courseId === courseId &&
          (!form.email || item.email === form.email)
        );
        if (me) {
          setForm(f => ({
            ...f,
            email:      me.email,
            fatherName: me.fatherName,
            phone:      me.phone,
            address1:   me.address1,
            pincode:    me.pincode,
            state:      me.state,
            city:       me.city,
          }));
        }
      } catch (e) {
        console.error("Failed to load pre‑admission:", e);
      }
    })();
  }, [courseId, form.email]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFile = (field: keyof AdmissionState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.files?.[0] || null }));
  };

  // 2️⃣ When PIN updates, auto‑fill state+city
  useEffect(() => {
    if (form.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${form.pincode}`)
        .then(r => r.json())
        .then((arr: any[]) => {
          const po = arr[0]?.PostOffice?.[0];
          if (po) {
            setForm(f => ({
              ...f,
              state: po.State,
              city:  po.District,
            }));
          }
        })
        .catch(console.error);
    }
  }, [form.pincode]);

  // 3️⃣ Submit Admission
 // inside your component…

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const payload = new FormData();
  // append all fields…
  [ "courseId","name","fatherName","phone","email",
    "address1","address2","pincode","state","city","dob"
  ].forEach(key => {
    payload.append(key, (form as any)[key]);
  });
  if (form.photoOfCandidate) payload.append("photoOfCandidate", form.photoOfCandidate);
  if (form.aadhaarFront)     payload.append("aadhaarFront",     form.aadhaarFront);
  if (form.aadhaarBack)      payload.append("aadhaarBack",      form.aadhaarBack);

  try {
    // 1️⃣ admission
    const res = await fetch(`/api/admission?transactionId=${transactionId}`, {
      method: "POST",
      body: payload,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Admission failed");

    // 2️⃣ invoice
    const invRes = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admissionFormId: json.admissionId,
        studentName:     json.name,
        phone:           json.phone,
        email:           json.email,
        courseId:        json.courseId,
        transactionId,
      }),
    });
    if (!invRes.ok) {
      const err = await invRes.json();
      throw new Error(err.error || "Invoice failed");
    }

    // 3️⃣ only *after* both succeeded, fire cleanup calls in parallel:
    await Promise.all([
      // clear deviceIdentifier in your /api/usercreation/deleteDeviceIdentifier
      fetch("/api/usercreation/deleteDeviceIdentifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: json.userId }), // make sure json.userId is returned from /api/admission
      }),
      // clear sessionToken cookie + server side
      fetch("/api/logout", { method: "POST" }),
    ]);

    alert("Admission & Invoice successful! You have been logged out. now you can continue on App or Desktop after login again.");
    router.push("/login");
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};


  // render
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Student Admission Form</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* courseName */}
            <input type="hidden" name="courseId" value={form.courseId} />
            <div className="col-span-full">
              <label className="block text-sm font-medium">Course Enrolling In</label>
              <input readOnly value={courseName} className="mt-1 w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2" />
            </div>

            {/* file uploads */}
            <div className="col-span-full">
              <label className="block text-sm font-medium">Photo of Candidate</label>
              <input type="file" accept="image/*" onChange={handleFile("photoOfCandidate")} title="Upload Photo of Candidate" placeholder="Upload a clear photo of the candidate" className="mt-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Aadhaar Front</label>
              <input type="file" accept="image/*" onChange={handleFile("aadhaarFront")} required title="Upload Aadhaar Front" placeholder="Upload the front side of Aadhaar card" className="mt-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Aadhaar Back</label>
              <input type="file" accept="image/*" onChange={handleFile("aadhaarBack")} required title="Upload Aadhaar Back" placeholder="Upload the back side of Aadhaar card" className="mt-1 w-full" />
            </div>

            {/* text inputs */}
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input title="Full Name" type="text" autoComplete="name" autoFocus
               name="name" value={form.name} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="FatherName" className="block text-sm font-medium">Father’s Name</label>
              <input title="Father's Name" type="text" autoComplete="name"	
             name="fatherName" value={form.fatherName} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input title="Phone Number" type="tel" autoComplete="tel"
               name="phone" value={form.phone} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input readOnly title="Email Address" autoComplete="email"
               name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium">Date of Birth</label>
              <input title="Date of Birth" autoComplete="bday"
               type="date" name="dob" value={form.dob} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
              {form.dob && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {format(new Date(form.dob), "MMMM d, yyyy")}
                </p>
              )}
            </div>

            {/* address */}
            <div className="col-span-full">
              <label className="block text-sm font-medium">Residential Address</label>
              <textarea title="Residential Address" autoComplete="address-line1"
              
              name="address1" value={form.address1} onChange={handleChange} rows={2} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium">Address Line 2 (optional)</label>
              <textarea title="Address Line 2" autoComplete="address-line2"
              
              name="address2" value={form.address2} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
            </div>

            {/* PIN → state/city */}
            <div>
              <label className="block text-sm font-medium">Pincode</label>
              <input title="Pincode" type="text" autoComplete="postal-code"
               name="pincode" value={form.pincode} onChange={handleChange} maxLength={6} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">State</label>
              <input title="State" type="text" autoComplete="address-level1"
               name="state" readOnly value={form.state} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">City</label>
              <input title="City" type="text" autoComplete="address-level2"
               name="city" readOnly value={form.city} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 bg-gray-100" />
            </div>

            {/* submit */}
            <div className="col-span-full text-center">
              <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl">
                SUBMIT TO ADMISSION
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
