"use client";

import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "./ui/button";

const navItems = [
  { href: "/admin/live-classes", label: "Manage Live Classes" },
  { href: "/admin/tutorials", label: "Manage Tutorials" },
  { href: "/admin/notes", label: "Manage Notes" },
  { href: "/admin/userCreation", label: "User Creation" },
  { href: "/admin/ebook", label: "Manage eBooks" },
  { href: "/admin/quiz", label: "Manage Quiz/Test-Series" },
  { href: "/admin/topics", label: "Manage Topics" },
  { href: "/admin/subjects", label: "Manage Subjects" },
  { href: "/admin/course", label: "Manage Courses" },
  { href: "/admin/notifications", label: "Manage Notifications" },
  { href: "/admin/bannerAds", label: "Manage Ads Banner" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden p-2 bg-white border-b">
        <Button onClick={() => setOpen(true)}>
          <Bars3Icon className="w-6 h-6 text-blue-900" />
        </Button>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-blue-900 text-white h-screen">
        <div className="flex items-center justify-center px-4 py-4 border-b border-blue-800">
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
        <nav className="mt-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <span className="block px-4 py-2 hover:bg-blue-700 transition-colors cursor-pointer">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Sidebar Drawer for Mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)}>
          <aside
            className="fixed top-0 left-0 z-50 w-64 h-full bg-blue-900 text-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-blue-800">
              <span className="text-lg font-bold">Admin Panel</span>
              <Button onClick={() => setOpen(false)}>
                <XMarkIcon className="w-6 h-6" />
              </Button>
            </div>
            <nav className="mt-4">
              <ul>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span
                        className="block px-4 py-2 hover:bg-blue-700 transition-colors cursor-pointer"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
