"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNo, setPhoneNo]           = useState("");
  const [address, setAddress]           = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);
  const router = useRouter();

  // Form is valid when every field is non-empty and passwords match
  const formValid = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      phoneNo.trim().length > 0 &&
      address.trim().length > 0 &&
      password === confirmPassword
    );
  }, [email, password, confirmPassword, phoneNo, address]);

  const handleSignup = async () => {
    if (!formValid) return;
    setError(null);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phoneNo, address }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Signup failed");
      }
    } catch (err: any) {
      setError(`${err.message} || unknown error occurred`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="px-8 py-10">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
            Create an Account
          </h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-green-700">
              Signup successful! Redirecting to login…
            </div>
          )}

          <div className="space-y-5">
            {/* Email */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="peer block w-full border-b-2 border-gray-300 bg-transparent py-2 px-1 text-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a Secure Password"
                required
                className="peer block w-full border-b-2 border-gray-300 bg-transparent py-2 px-1 text-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className={`peer block w-full border-b-2 ${
                  password !== "" && password !== confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } bg-transparent py-2 px-1 text-gray-800 focus:border-blue-500 focus:outline-none`}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Phone number */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Enter Phone Number
              </label>
              <input
                id="phoneNo"
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="Phone Number"
                required
                className="peer block w-full border-b-2 border-gray-300 bg-transparent py-2 px-1 text-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Address */}
            <div className="relative">
              <label htmlFor="address" className="text-sm font-medium text-gray-700">
                Residential Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Residential Address"
                required
                rows={3}
                className="peer block w-full resize-none rounded-md border border-gray-300 bg-transparent py-2 px-3 text-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignup}
            disabled={!formValid}
            className={`
              mt-8 w-full text-white font-semibold py-3 rounded-full shadow-lg
              transition
              ${
                formValid
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            Sign Up
          </button>

          {/* Sign In Link */}
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
