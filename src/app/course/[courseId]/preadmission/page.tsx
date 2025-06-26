// File: src/app/course/[courseId]/preadmission/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { ClockIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
// import type { InitiatePaymentResponse } from "@/path/to/your/types";

interface PreAdmissionForm {
  email:       string;
  name:       string;
  gender:      "male" | "female" | "other" | "";
  phone:       string;
  fatherName:  string;
  address1:    string;
  address2:    string;
  pincode:     string;
  state:       string;
  city:        string;
  dob:         string; // Added date of birth field
}
interface PhonePeRedirectInfo {
    url: string;
    method?: string;
  }
interface InstrumentResponse {
    type: string;
    redirectInfo: PhonePeRedirectInfo;
  }
interface InitiatePaymentResponse {
    success: boolean;
    code: string;
    message: string;
    data: {
      instrumentResponse: InstrumentResponse;
    };
  }

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

export default function PreAdmissionPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const coursePrice = Number(searchParams.get("coursePrice") || "0");
  const promoCodeFromQS = searchParams.get("promoCode") || "";

  const [formData, setFormData] = useState<PreAdmissionForm>({
    email:      "",
    name:      "",
    gender:     "",
    phone:      "",
    fatherName: "",
    address1:   "",
    address2:   "",
    pincode:    "",
    state:      "",
    city:       "",
    dob:        "", // Default to today
  });
  const [loading, setLoading] = useState(false);

   // ——— On mount: fetch profile ———
   useEffect(() => {
    axios.get("/api/profile")
      .then(res => {
        if (res.data.email) {
          setFormData(f => ({ ...f, email: res.data.email }));
        } else {
          throw new Error("No email");
        }
      })
      .catch(() => {
        // Not authenticated (404/401) → redirect to login, preserve returnTo
        const returnTo = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        router.push(`/login?returnTo=${returnTo}`);
      });
  }, [router]);

  // PIN → state/city lookup
useEffect(() => {
    const pin = formData.pincode;
    if (pin.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then(r => r.json())
        .then((arr: any[]) => {
          if (arr[0]?.Status === "Success" && arr[0].PostOffice?.length) {
            const po = arr[0].PostOffice[0];
            setFormData(f => ({
              ...f,
              state: po.State,
              city: po.District,
            }));
          }
        })
        .catch(console.error);
    }
  }, [formData.pincode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handlePurchase = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      // 1) persist pre‑admission
      await axios.post("/api/pre-admission", {
        ...formData,
        courseId,
      });

      // 2) initiate PhonePe
      const { data } = await axios.post<InitiatePaymentResponse & {
        redirectUrl?: string;
        redirect?: string;
      }>(
        "/api/initiatePayment",
        { amount: coursePrice, courseId , promoCode: promoCodeFromQS },
        { headers: { "Content-Type": "application/json" } }
      );

      const redirect =
        data.redirectUrl ||
        data.redirect ||
        data.data?.instrumentResponse?.redirectInfo?.url;

      if (!redirect) throw new Error("No redirect URL");

      window.location.href = redirect;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }, [courseId, formData,  coursePrice, promoCodeFromQS]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Pre‑Admission Form
          </h2>
          <div className="p-4 bg-red-100 border-l-4 border-red-600 text-red-800">
  <strong>⚠️ IMPORTANT:</strong> Do NOT go back, cancel, or switch to another app until you’ve completed the admission step after payment.  
  Interrupting the flow may cause your payment to get stuck. After successful payment you will be redirected automatically—please be patient!
</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email ID
              </label>
              <input
              title="Email ID is mandatory"
              readOnly
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name:
              </label>
              <input
              title="Name is mandatory"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
              title="gender is mandatory"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              >
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
              title="Phone Number is mandatory and should be in the format +91XXXXXXXXXX"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* Father’s Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Father’s Name
              </label>
              <input
              title="Father's Name is mandatory"
                name="fatherName"
                type="text"
                value={formData.fatherName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* Address Line 1 */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1
              </label>
              <textarea
              title="Address Line 1 is mandatory"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                rows={2}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* Address Line 2 */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2 (optional)
              </label>
              <textarea
              title="Address Line 2 is optional"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
              title="Pincode will be used to auto-fill State and City"
                name="pincode"
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <select
              title="State will be auto-filled based on Pincode"

                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3"
              >
                <option value="" disabled>
                  -- Select State --
                </option>
                {indianStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
              title="City will be auto-filled based on Pincode"
                type="text"
                name="city"
                value={formData.city}
                readOnly
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 bg-gray-100"
              />
            </div>
            <div>
                          <label className="block text-sm font-medium">Date of Birth</label>
                          <input title="Date of Birth" autoComplete="bday"
                           type="date" name="dob" value={formData.dob} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" />
                          {formData.dob && (
                            <p className="text-sm text-gray-600 mt-1">
                              Selected: {format(new Date(formData.dob), "MMMM d, yyyy")}
                            </p>
                          )}
              </div>

            {/* Buy Now Button spans full width */}
            <div className="col-span-full text-center">
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition inline-flex items-center justify-center space-x-2"
              >
                {loading && <ClockIcon className="h-5 w-5 animate-spin" />}
                <span>{loading ? "Processing…" : "Buy Now"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
