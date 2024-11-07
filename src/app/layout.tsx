import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar"; // Import Navbar component
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import AuthProvider from "@/context/AuthProvider";
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
      <body className={inter.className}>
        {/* Include Navbar */}
        <Navbar />
        {children}
        <Toaster />
      </body>
      </AuthProvider>
    </html>
  );
}
