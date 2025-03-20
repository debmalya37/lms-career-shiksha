"use client";
import Link from "next/link";
import { useState } from "react";

export default function DeleteAccountPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    // Ask for confirmation from the user
    const confirmed = confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/deleteAccount", {
        method: "POST",
        credentials: "include", // Include cookies for session authentication
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirm: true }),
      });

      if (res.ok) {
        setMessage(
          "Your account deletion request has been submitted. Our support team will process it shortly."
        );
      } else {
        setMessage("There was an error processing your request. Please try again later.");
      }
    } catch (error) {
      console.error("Deletion error:", error);
      setMessage("An error occurred. Please try again later.");
    }
    setIsDeleting(false);
  };

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md max-w-xl mt-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Delete Your Account & Data</h1>
      <p className="mb-4">
        This page allows you to request the deletion of your account and all associated data from{" "}
        <strong>Career Shiksha Learning Portal</strong> (as shown on our store listing). Please read the instructions carefully before proceeding.
      </p>
      <h2 className="text-xl font-semibold mb-2">Step-by-Step Instructions</h2>
      <ol className="list-decimal list-inside mb-4 text-gray-800">
        <li>
          Click the <strong>&quot;Delete My Account&quot;</strong> button below. This sends a deletion request for your account.
        </li>
        <li>
          Your personal information—including your name, email, subscription details, course data, and profile information—will be permanently deleted from our systems.
        </li>
        <li>
          For compliance and legal purposes, some account deletion logs may be retained for up to 90 days.
        </li>
        <li>
          Once processed, the deletion is irreversible. Please ensure you have confirmed your decision and saved any information you wish to keep.
        </li>
        <li>
          If you have any questions or need further assistance, please contact our support team at{" "}
          <Link href="mailto:civilacademy98@gmail.com" className="text-blue-600 underline">
          civilacademy98@gmail.com
          </Link>.
        </li>
      </ol>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
      >
        {isDeleting ? "Processing..." : "Delete My Account"}
      </button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
