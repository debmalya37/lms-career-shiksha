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
} from "react-icons/fi";
import { BellIcon, UserIcon } from "@heroicons/react/24/solid";
import Logo from "../../public/image/logo.jpeg";
import NotificationPopup from "@/components/NotificationPopup";

interface AdminNotification {
  _id: string;
  text: string;
  createdAt: string;
}
interface Props {
  latestLiveClasses: any[];
  latestTutorial: any;
  latestCourse: any;
  adminNotifications: AdminNotification[];
}

const Navbar: React.FC = () => 
  {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [latestLiveClasses, setLatestLiveClasses] = useState<any[]>([]);
const [latestTutorial, setLatestTutorial] = useState<any>(null);
const [latestCourse, setLatestCourse] = useState<any>(null);
const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);


  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

  const navLinks = [
    { name: "Home", href: "/", icon: <FiHome /> },
    { name: "My Courses", href: "/courses", icon: <FiBookOpen /> },
    { name: "My Tutorials", href: "/tutorials", icon: <FiVideo /> },
    { name: "My Leaderboard", href: "/leaderboard", icon: <FiVideo /> },
    { name: "My Live Classes", href: "/live-classes", icon: <FiLayers /> },
    { name: "My Notes", href: "/notes", icon: <FiLayers /> },
    { name: "My Invoices", href: "/u/invoice", icon: <FiLayers /> },
    { name: "Contact", href: "/contact", icon: <FiPhone /> },
  ];


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
  
        setLatestLiveClasses(data.latestLiveClasses || []);
        setLatestTutorial(data.latestTutorial || null);
        setLatestCourse(data.latestCourse || null);
        setAdminNotifications(data.adminNotifications || []);
      } catch (err) {
        console.error("Failed to fetch notification data:", err);
      }
    };
  
    fetchNotifications();
  }, []);
  

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    }
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="relative z-50">
      {/* Top Navbar */}
      <header className="bg-white shadow-md fixed w-full z-50 h-16">

        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {/* Menu Toggle */}
          <button onClick={toggleSidebar} className="text-blue-700">
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src={Logo} alt="Logo" width={40} height={40} className="rounded-full" />
            <span className="font-bold text-lg text-blue-900">Career Shiksha</span>
          </Link>

          {/* Notification & Profile */}
          <div className="flex items-center space-x-4">
            <BellIcon
              className="h-6 w-6 text-blue-600 cursor-pointer"
              onClick={toggleNotification}
            />
            <Link href="/profile">
              <UserIcon className="h-6 w-6 text-blue-600 cursor-pointer" />
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity md:hidden" />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mt-16 p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 text-gray-700 hover:text-blue-700 font-medium ${
                pathname === link.href ? "text-blue-700" : ""
              }`}
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
    latestLiveClasses={latestLiveClasses}
    latestTutorial={latestTutorial}
    latestCourse={latestCourse}
    adminNotifications={adminNotifications}
  />
)}

    </div>
  );
};

export default Navbar;
