"use client";

import React, { useState } from "react";
import { FiMenu, FiX, FiHome, FiBookOpen, FiVideo, FiLayers, FiFileText, FiPhone } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/image/logo.jpeg";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 p-5 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center space-x-3">
            <Image src={Logo} alt="Career Shiksha Logo" width={40} height={40} className="rounded-full" />
            <span className="text-xl font-bold tracking-wide">Career Shiksha</span>
          </Link>
          <button title="close" onClick={toggleNavbar} className="text-blue focus:outline-none">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4">
          <Link href="/" className="flex items-center space-x-3 p-2 rounded hover:bg-blue-700">
            <FiHome className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link href="/tutorials" className="flex items-center space-x-3 p-2 rounded hover:bg-blue-700">
            <FiBookOpen className="h-5 w-5" />
            <span>Tutorials</span>
          </Link>
          <Link href="/live-classes" className="flex items-center space-x-3 p-2 rounded hover:bg-blue-700">
            <FiVideo className="h-5 w-5" />
            <span>Live Classes</span>
          </Link>
          <Link href="/courses" className="flex items-center space-x-3 p-2 rounded hover:bg-blue-700">
            <FiLayers className="h-5 w-5" />
            <span>Courses</span>
          </Link>
          <Link href="/notes" className="flex items-center space-x-3 p-2 rounded hover:bg-blue-700">
            <FiFileText className="h-5 w-5" />
            <span>Notes</span>
          </Link>
          <Link href="/leaderboard" className="flex items-center space-x-3 p-2 rounded hover:bg-blue-700">
            <FiFileText className="h-5 w-5" />
            <span>Leaderboard</span>
          </Link>e
          <Link href="/contact" className="flex items-center space-x-3 p-2 rounded hover:bg-blue-700">
            <FiPhone className="h-5 w-5" />
            <span>Contact</span>
          </Link>
        </nav>
      </div>

      {/* Toggle Button */}
      {!isOpen && (
        <button
        title="menu"
        onClick={toggleNavbar}
        className="fixed top-11 left-5 bg-gray-900 text-white p-2 rounded z-[51] focus:outline-none"
      >
         <FiMenu className="h-6 w-6" />
      </button>
      )}
      {/* <button
        onClick={toggleNavbar}
        className="fixed top-5 left-5 bg-gray-900 text-white p-2 rounded z-[51] focus:outline-none"
      >
        {isOpen ? <FiX className="h-0 w-0 md:hidden" /> : <FiMenu className="h-6 w-6" />}
      </button> */}

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleNavbar}
        />
      )}
    </>
  );
};

export default Navbar;
