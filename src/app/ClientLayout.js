// File: src/app/ClientLayout.js

'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import ClientOnly from "./components/ClientOnly";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "@/context/ThemeProvider";
import ThemedToaster from "./components/ThemedToaster";
import { Providers } from "./components/Providers";
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ClientLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <ThemeProvider>
            <LayoutContent>{children}</LayoutContent>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

function LayoutContent({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.forcePasswordChange && pathname !== '/change-password') {
        console.log("Redirecting to /change-password due to forcePasswordChange flag.");
        router.push('/change-password');
      }
    }
    if (status === 'authenticated' && session?.user && !session.user.forcePasswordChange && pathname === '/change-password') {
      console.log("Redirecting away from /change-password as forcePasswordChange is false.");
      router.push('/dashboard');
    }
  }, [session, status, router, pathname]);

  useEffect(() => {
    console.log("Current Session:", session);
    if (session?.user) {
        console.log("Session User Role:", session.user.role);
        console.log("Session User forcePasswordChange:", session.user.forcePasswordChange);
    }
   }, [session]); // Log whenever session changes

  return (
    <div className="flex flex-col min-h-screen">
      <ClientOnly>
        <Navbar />
      </ClientOnly>

      <ClientOnly>
        <ThemedToaster />
      </ClientOnly>

      <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8">
        {children}
      </main>

      <ClientOnly>
        <Footer />
      </ClientOnly>
    </div>
  );
}