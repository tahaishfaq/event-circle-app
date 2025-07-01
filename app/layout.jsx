"use client";

import { SessionProvider } from "next-auth/react";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-geist" suppressHydrationWarning>
        <SessionProvider>
          <Navbar/>
          {children}
          <Toaster />
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
