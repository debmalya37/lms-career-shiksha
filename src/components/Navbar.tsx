import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-semibold">LMS</h1>
        <div className="space-x-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/tutorials" className="hover:underline">Tutorials</Link>
          <Link href="/live-classes" className="hover:underline">Live Classes</Link>
          <Link href="/notes" className="hover:underline">Notes</Link>
          <Link href="/test-series" className="hover:underline">Test Series</Link>
          <Link href="/about" className="hover:underline">About Us</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
