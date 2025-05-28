// app/status/[id]/page.tsx
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
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

interface Course {
  _id: string;
  title: string;
}

export default function StatusPage() {
  const { id: transactionId } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const courseIdFromUrl = searchParams.get("courseId")!;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(courseIdFromUrl);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);

  const [triedReload, setTriedReload] = useState(false);

  // if error on first load, reload once
  // useEffect(() => {
  //   if (error && !triedReload) {
  //     setTriedReload(true);
  //     setTimeout(() => window.location.reload(), 500);
  //   }
  // }, [error, triedReload]);

  const fetchStatus = useCallback(async () => {
    if (!transactionId) return;

    setLoading(true);
    setError(null);
    setStatus(null);
    setTxId(null);
    setCourseTitle(null);

    try {
      const { data } = await axios.get(`/api/status?id=${transactionId}&courseId=${courseIdFromUrl}&raw=true`)

      if (!data.success) throw new Error(`${data.code}: ${data.message}`);

      setStatus(data.code);
      setTxId(data.data!.transactionId);
      const cid = data.data!.courseId ?? courseIdFromUrl;
      setCourseId(cid);

      toast.success(`Transaction ${data.code}`);

      if (data.code === "PAYMENT_SUCCESS" && cid) {
        const courseRes = await axios.get<{ course: Course }>(
          `/api/course/${cid}`
        );
        setCourseTitle(courseRes.data.course.title);
      }
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : (err as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [transactionId, courseIdFromUrl]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const isSuccess = status === "PAYMENT_SUCCESS";

  const downloadInvoice = async () => {
    if (!txId || !courseId) return;
    try {
      const res = await fetch(`/api/invoice/${txId}/${courseId}`, {
        headers: { Accept: "application/pdf" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${txId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error", err);
      alert("Could not download invoice. Please try again.");
    }
  };

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
          ) : error ? (
            <div className="text-center space-y-4">
              <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchStatus}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                {isSuccess ? (
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                ) : (
                  <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
                )}
                <h2
                  className={`mt-4 text-2xl font-bold ${
                    isSuccess ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {isSuccess ? "Payment Successful" : "Payment Failed"}
                </h2>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Txn ID:</span>
                  <span className="text-gray-900">{txId}</span>
                </div>
                {courseTitle && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Course:</span>
                    <span className="text-gray-900">{courseTitle}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                {isSuccess && courseId && (
                  <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Go to Course
                  </button>
                )}
                {isSuccess && txId && courseId && (
                  <button
                    onClick={downloadInvoice}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Download Invoice
                  </button>
                )}
              </div>

              <div className="text-center">
                <Link href="/">
                  <span className="text-sm text-gray-500 hover:underline">
                    Back to Home
                  </span>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
