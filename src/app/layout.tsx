import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar"; // Import Navbar component
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Career Shiksha LMS Platform",
  description: "Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Include Navbar */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
