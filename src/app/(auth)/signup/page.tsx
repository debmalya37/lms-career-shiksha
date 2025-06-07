"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
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
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="peer block w-full border-b-2 border-gray-300 bg-transparent py-2 px-1 text-gray-800 placeholder-transparent focus:border-blue-500 focus:outline-none"
              />
              <label
                htmlFor="email"
                className="absolute left-1 top-2 text-gray-500 text-sm transform 
                           transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base 
                           peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"
              >
                Email address
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className="peer block w-full border-b-2 border-gray-300 bg-transparent py-2 px-1 text-gray-800 placeholder-transparent focus:border-blue-500 focus:outline-none"
              />
              <label
                htmlFor="password"
                className="absolute left-1 top-2 text-gray-500 text-sm transform 
                           transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base 
                           peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"
              >
                Password
              </label>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                required
                className="peer block w-full border-b-2 border-gray-300 bg-transparent py-2 px-1 text-gray-800 placeholder-transparent focus:border-blue-500 focus:outline-none"
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-1 top-2 text-gray-500 text-sm transform 
                           transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base 
                           peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"
              >
                Confirm Password
              </label>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <input
                id="phoneNo"
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder=" "
                required
                className="peer block w-full border-b-2 border-gray-300 bg-transparent py-2 px-1 text-gray-800 placeholder-transparent focus:border-blue-500 focus:outline-none"
              />
              <label
                htmlFor="phoneNo"
                className="absolute left-1 top-2 text-gray-500 text-sm transform 
                           transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base 
                           peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"
              >
                Phone Number
              </label>
            </div>

            {/* Address */}
            <div className="relative">
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder=" "
                required
                rows={3}
                className="peer block w-full resize-none rounded-md border border-gray-300 bg-transparent py-2 px-3 text-gray-800 placeholder-transparent focus:border-blue-500 focus:outline-none"
              />
              <label
                htmlFor="address"
                className="absolute left-3 top-2 text-gray-500 text-sm transform 
                           transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base 
                           peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"
              >
                Residential Address
              </label>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSignup}
            className="mt-8 w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 transition"
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
