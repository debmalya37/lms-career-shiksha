// app/failure/[id]/page.tsx
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface PhonePeStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    transactionId: string;
    courseId?: string;
  };
}

export default function FailurePage() {
  const { id: transactionId } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const courseIdFromUrl = searchParams.get("courseId")!;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<PhonePeStatusResponse>(
        `/api/status?id=${transactionId}&courseId=${courseIdFromUrl}&raw=true`
      );

      // If status shows success, redirect to /success
      if (data.success) {
        router.replace(`/success/${transactionId}?courseId=${courseIdFromUrl}`);
        return;
      }

      // Otherwise, show “failure”
      setStatusCode(data.code);
    } catch (err) {
      const errMsg =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : (err as Error).message;
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [transactionId, courseIdFromUrl, router]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-4">Payment Status</h1>
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <motion.div
          className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <ArrowPathIcon className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-600">Verifying your payment...</p>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-red-800">
                Payment Failed
              </h2>
              {error ? (
                <p className="text-gray-700">{error}</p>
              ) : statusCode ? (
                <p className="text-gray-700">
                  <span className="font-medium">Error Code:</span> {statusCode}
                </p>
              ) : null}

              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 justify-center">
                <Link
                  href="/"
                  className="inline-flex justify-center items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Back to Home
                </Link>
                <button
                  onClick={fetchStatus}
                  className="inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Retry Status
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
