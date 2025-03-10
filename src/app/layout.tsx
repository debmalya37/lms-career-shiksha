import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import '../lib/subscriptionCron';

import AuthProvider from "@/context/AuthProvider";
import { startSubscriptionCron } from "../lib/subscriptionCron";
import Footer from "@/components/Footer";
import DisableRightClick from "@/components/DisableRightClick"; // Import the client component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Career Shiksha Learning Portal",
  description: "Learning Management System",
};

if (typeof window === "undefined") {
  startSubscriptionCron(); // Ensure this runs only on the server
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={`${inter.className} bg-gradient-to-b from-gray-100 to-blue-100`} >
          <Navbar />
          <DisableRightClick />
          {children}
          <Toaster />
          <Footer />
        </body>
      </AuthProvider>
    </html>
  );
}
