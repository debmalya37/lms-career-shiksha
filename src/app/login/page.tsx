"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const generateDeviceIdentifier = () => {
  return "device-" + Math.random().toString(36).substring(2, 15);
};

const getDeviceIdentifier = () => {
  try {
    let identifier = localStorage.getItem("deviceIdentifier");
    if (!identifier) {
      identifier = generateDeviceIdentifier();
      localStorage.setItem("deviceIdentifier", identifier);
    }
    return identifier;
  } catch (e) {
    console.warn("LocalStorage unavailable, generating temporary identifier");
    return generateDeviceIdentifier();
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get device identifier using the helper function
    const deviceIdentifier = getDeviceIdentifier();

    try {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, deviceIdentifier }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("sessionToken", data.sessionToken);
        router.push("/");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to log in");
      }
    } catch (error:any) {
      console.error('Error during login:', error); // Log detailed error
      setErrorMessage(`Login failed: ${error.message || 'Unknown error'}`);
    }
    
  };

  return (
    <div
      className="
        flex 
        justify-center 
        items-center 
        min-h-screen 
        bg-gradient-to-r 
        from-[#bbd9eb] 
        to-[#7667d5]
        p-4
      "
    >
      <form
        onSubmit={handleSubmit}
        className="
          flex 
          flex-col 
          gap-3
          bg-white
          p-10
          rounded-[25px]
          transition-all
          duration-300
          shadow-[1px_2px_2px_rgba(0,0,0,0.4)]
          hover:translate-x-[-8px]
          hover:translate-y-[-8px]
          hover:border
          hover:border-[#171717]
          hover:shadow-[10px_10px_0_#666666]
          w-full
          max-w-sm
        "
      >
        <h1 className="text-black pb-8 text-center font-bold text-xl">Log In</h1>

        {errorMessage && (
          <p className="text-red-600 text-center">{errorMessage}</p>
        )}

        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          title="email"
          type="email"
          className="
            rounded-[5px]
            border 
            border-[whitesmoke]
            bg-[whitesmoke]
            outline-none
            p-[0.7em]
            transition-all
            duration-300
            ease-in-out
            hover:shadow-[6px_6px_0_#969696,_-3px_-3px_10px_#ffffff]
            focus:bg-white
            focus:shadow-[inset_2px_5px_10px_rgba(0,0,0,0.3)]
          "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          title="password"
          type="password"
          className="
            rounded-[5px]
            border 
            border-[whitesmoke]
            bg-[whitesmoke]
            outline-none
            p-[0.7em]
            transition-all
            duration-300
            ease-in-out
            hover:shadow-[6px_6px_0_#969696,_-3px_-3px_10px_#ffffff]
            focus:bg-white
            focus:shadow-[inset_2px_5px_10px_rgba(0,0,0,0.3)]
          "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="
            mt-8
            self-center
            py-3 px-6
            rounded-[10px]
            text-black
            transition-all
            duration-300
            ease-in-out
            shadow-[1px_1px_1px_rgba(0,0,0,0.4)]
            hover:shadow-[6px_6px_0_#969696,_-3px_-3px_10px_#ffffff]
            hover:-translate-x-2
            hover:-translate-y-2
            active:shadow-none
            active:translate-x-0
            active:translate-y-0
          "
        >
          Log In
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm">
            New user?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
