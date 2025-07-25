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
  { name: "Home", href: "/", icon: <FiHome /> },
  { name: "Courses", href: "/courses", icon: <FiBookOpen /> },
  // { name: "Tutorials", href: "/tutorials", icon: <FiVideo /> },
  { name: "Live classes", href: "/live-classes", icon: <FiVideo /> },
  { name: "Leaderboard", href: "/leaderboard", icon: <FiAward /> },
  { name: "Notes", href: "/notes", icon: <FiFileText /> },
  { name: "Progress", href: "/u/quizresults", icon: <FiAward /> },
  { name: "Contact", href: "/contact", icon: <FiPhone /> },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setAdminNotifications)
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    }
    if (sidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-md flex flex-col">
      {/* First row: logo, mobile toggle, notifications/profile */}
      <div className="flex items-center justify-between h-[6.5rem] md:h-16 px-4 md:px-8">
        {/* Mobile: Hamburger */}
        <button
          className="md:hidden text-blue-700 mr-4 "
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src={Logo}
            alt="Civil Academy"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="ml-2 font-bold text-xl text-blue-900">
            Civil Academy
          </span>
        </Link>

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
      </div>

      {/* Second row: desktop nav links */}
      <nav className="hidden md:flex justify-center space-x-6 py-2 border-t border-gray-200">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`
              flex items-center space-x-1 px-3 py-1 rounded-md
              text-gray-700 hover:text-blue-700 transition
              bg-blue-100
              ${pathname === link.href ? "bg-blue-200 text-blue-950" : ""}
            `}
          >
            <span className="text-lg">{link.icon}</span>
            <span className="whitespace-nowrap">{link.name}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Sidebar Overlay */}
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
          latestLiveClasses={[]}
          latestTutorial={null}
          latestCourse={null}
          adminNotifications={adminNotifications}
        />
      )}
    </header>
  );
};

export default Navbar;
