"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiMenu,
  FiX,
  FiHome,
  FiBookOpen,
  FiVideo,
  FiLayers,
  FiFileText,
  FiPhone,
  FiUser,
  FiBell,
  FiAward,
} from "react-icons/fi";
import { BellIcon, UserIcon } from "@heroicons/react/24/solid";
import Logo from "../../public/image/logo.jpeg";
import NotificationPopup from "@/components/NotificationPopup";

interface AdminNotification {
  _id: string;
  text: string;
  createdAt: string;
}
interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navLinks: NavLink[] = [
  { name: "Home", href: "/",        icon: <FiHome /> },
  { name: "Courses", href: "/courses", icon: <FiBookOpen /> },
  { name: "Tutorials", href: "/tutorials", icon: <FiVideo /> },
  { name: "Live Classes", href: "/live-classes", icon: <FiLayers /> },
  { name: "Notes", href: "/notes",     icon: <FiFileText /> },
  { name: "Track Progress", href: "/u/quizresults", icon: <FiAward /> },
  { name: "Contact", href: "/contact",  icon: <FiPhone /> },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch notifications once
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setAdminNotifications)
      .catch(console.error);
  }, []);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setSidebarOpen(false);
      }
    }
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-md h-16 flex items-center px-4 md:px-8">
      {/* Mobile: Hamburger */}
      <button
        className="md:hidden text-blue-700 mr-4"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Logo */}
      <Link href="/" className="flex items-center flex-shrink-0">
        <Image
          src={Logo}
          alt="Career Shiksha"
          width={36}
          height={36}
          className="rounded-full"
        />
        <span className="ml-2 font-bold text-xl text-blue-900">
          Career Shiksha
        </span>
      </Link>

      {/* Desktop Nav Links */}
      <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-1 text-gray-700 hover:text-blue-700 font-normal mr-1 ${
              pathname === link.href ? "text-blue-700" : ""
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification & Profile */}
      <div className="flex items-center space-x-4">
        <FiBell
          className="h-6 w-6 text-blue-600 cursor-pointer"
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        />
        <Link href="/profile">
          <FiUser className="h-6 w-6 text-blue-600 cursor-pointer" />
        </Link>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" />
      )}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mt-16 p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 text-gray-700 hover:text-blue-700 font-medium ${
                pathname === link.href ? "text-blue-700" : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Notification Popup */}
      {isNotificationOpen && (
        <NotificationPopup
          close={() => setIsNotificationOpen(false)}
          latestLiveClasses={[]}  // pass your data here
          latestTutorial={null}
          latestCourse={null}
          adminNotifications={adminNotifications}
        />
      )}
    </header>
  );
};

export default Navbar;
