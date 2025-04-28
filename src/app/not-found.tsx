// src/app/not-found.tsx
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-center h-screen px-6 md:px-24 bg-white">
      {/* Left side: text and buttons */}
      <div className="w-full md:w-1/2 text-center md:text-left mt-12 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          Something&apos;s wrong here…
        </h1>
        <p className="text-gray-500 mb-8">
          We can&apos;t find the page you&apos;re looking for. Check out our{" "}
          <Link
            href="/contact"
            className="text-blue-600 hover:underline"
          >
            Help Center
          </Link>{" "}
          or head back to{" "}
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            home
          </Link>
          .
        </p>
        <div className="space-x-4">
          <Link
            href="/contact"
            className="inline-block px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
          >
            Help
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-2 border border-gray-800 text-gray-800 rounded hover:bg-gray-100 transition"
          >
            Home
          </Link>
        </div>
      </div>

      {/* Right side: illustration */}
      <div className="w-full md:w-1/2 flex justify-center">
        {/* 
          Place a 404 illustration in public/404-illustration.png
          You can download the question-mark graphic from your design assets.
        */}
        <Image
          src="/404.jpg"
          alt="Question mark illustration"
          width={250}
          height={350}
          className="object-contain"
        />
      </div>
    </div>
  );
}
