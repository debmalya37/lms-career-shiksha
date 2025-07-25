// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Navbar from "@/components/Navbar";
import "./globals.css";
import 'stream-chat-react/dist/css/v2/index.css';
import '../lib/subscriptionCron';

import AuthProvider from "@/context/AuthProvider";
import DisableRightClick from "@/components/DisableRightClick";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Civil Academy Learning Portal",
  description: "Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body
          className={`${inter.className} bg-gradient-to-b from-gray-100 to-blue-100`}
        >
          {/* Fixed Navbar */}
          <Navbar />

          {/* Prevent right‑click */}
          <DisableRightClick />

          {/* Main content pushed below the 64px navbar */}
          <main className="pt-28">
            {children}
          </main>

          {/* Global UI */}
          <Toaster />
          <Footer />
        </body>
      </AuthProvider>
    </html>
  );
}
