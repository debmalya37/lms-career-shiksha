"use client";
import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      {/* Main Navbar */}
      <nav className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl font-bold tracking-wide hover:text-yellow-400 transition-colors">
          Civil Academy
        </h1>
        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 text-lg font-medium">
          <Link href="/" className="hover:text-yellow-400 transition-colors">
            Home
          </Link>
          <Link href="/tutorials" className="hover:text-yellow-400 transition-colors">
            Tutorials
          </Link>
          <Link href="/live-classes" className="hover:text-yellow-400 transition-colors">
            Live Classes
          </Link>
          <Link href="/courses" className="hover:text-yellow-400 transition-colors">
            Courses
          </Link>
          <Link href="/notes" className="hover:text-yellow-400 transition-colors">
            Notes
          </Link>
          <Link href="/test-series" className="hover:text-yellow-400 transition-colors">
            Test Series
          </Link>
          <Link href="/contact" className="hover:text-yellow-400 transition-colors">
            Contact
          </Link>
        </div>
        {/* Hamburger Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none text-white"
        >
          {isOpen ? <FiX className="h-8 w-8" /> : <FiMenu className="h-8 w-8" />}
        </button>
      </nav>

      {/* Mobile Navbar */}
      <div
        className={`fixed inset-0 bg-blue-600 bg-opacity-95 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 md:hidden`}
      >
        <div className="md:hidden mt-4 ml-3">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-full space-y-8 text-lg font-semibold">
          <Link
            href="/"
            className="text-white hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/tutorials"
            className="text-white hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Tutorials
          </Link>
          <Link
            href="/live-classes"
            className="text-white hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Live Classes
          </Link>
          <Link
            href="/courses"
            className="text-white hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Courses
          </Link>
          <Link
            href="/notes"
            className="text-white hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Notes
          </Link>
          <Link
            href="/test-series"
            className="text-white hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Test Series
          </Link>
          {/* <Link
            href="/about"
            className="text-white hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link> */}
          <Link
            href="/contact"
            className="text-white hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
