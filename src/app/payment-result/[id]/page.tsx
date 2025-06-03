// File: app/payment-result/[id]/page.tsx
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentResultPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId"); // original courseId we passed
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        // Call our server wrapper which in turn calls PhonePe’s Check Status
        const { data } = await axios.get(`/api/phonepe/check?id=${id}`);
        // PhonePe’s JSON has { success: boolean, code: string, … }
        // We treat code === "PAYMENT_SUCCESS" as success.
        if (data.code === "PAYMENT_SUCCESS") {
          // Navigate to our “success” page
          router.replace(`/success/${id}?courseId=${courseId}`);
        } else {
          // Any other code (FAILURE, PENDING, etc) → failure page
          router.replace(`/failure/${id}?courseId=${courseId}`);
        }
      } catch (e) {
        // In case of network or server error, also treat as failure
        router.replace(`/failure/${id}?courseId=${courseId}`);
      }
    }
    checkStatus();
  }, [id, courseId, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-700">Verifying payment status…</p>
    </div>
  );
}
