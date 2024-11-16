"use client";
import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold">Civil Academy Learning Portal</h1>
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/tutorials" className="hover:underline">Tutorials</Link>
          <Link href="/live-classes" className="hover:underline">Live Classes</Link>
          <Link href="/courses" className="hover:underline">Courses</Link>
          <Link href="/notes" className="hover:underline">Notes</Link>
          {/* <Link href="/test-series" className="hover:underline">Test Series</Link> */}
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
        {/* Hamburger Menu */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-600 p-4">
          <Link href="/" className="block hover:underline">Home</Link>
          <Link href="/tutorials" className="block hover:underline">Tutorials</Link>
          <Link href="/live-classes" className="block hover:underline">Live Classes</Link>
          <Link href="/courses" className="block hover:underline">Courses</Link>
          <Link href="/notes" className="block hover:underline">Notes</Link>
          <Link href="/test-series" className="block hover:underline">Test Series</Link>
          <Link href="/about" className="block hover:underline">About Us</Link>
          <Link href="/contact" className="block hover:underline">Contact</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
