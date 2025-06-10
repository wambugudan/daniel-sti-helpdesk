// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// // import { SessionProvider } from "next-auth/react";
// import Footer from "./components/Footer";
// import ClientOnly from "./components/ClientOnly";
// import Navbar from "./components/Navbar"; // Import Navbar component
// import { ThemeProvider } from "@/context/ThemeProvider"; // Import ThemeProvider
// import { Toaster } from "react-hot-toast";
// import ThemedToaster from "./components/ThemedToaster";
// import { Providers } from "./components/Providers";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "STI-Policy | Helpdesk",
//   description: "Connecting you with the right help",
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

// export default function RootLayout({ children }) {
//   // const { currentUser } = useCurrentUser();
//   return (
//     // <html lang="en">
//     <html lang="en" data-theme="light">

//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <Providers>
//           <ThemeProvider> {/* 🔹 Wrap app inside ThemeProvider */}
//             <div className="flex flex-col min-h-screen">

//               {/*  Navbar */}
//               {/* Wraping with ClientOnly to allow for hydration */}
//               <ClientOnly>
//                 <Navbar />
//               </ClientOnly>   

//               {/* Toasts */}
//               <ClientOnly>              
//                 <ThemedToaster />
//               </ClientOnly>         
              
//               <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8">
//                 {children}
//               </main> 
              
//               {/* Footer */}
//               {/* Wraping with ClientOnly to allow for hydration */}
//               <ClientOnly>
//                 <Footer />
//               </ClientOnly>
//             </div>
//           </ThemeProvider>
//         </Providers>
//       </body>
//     </html>
//   );
// }


// Version 2: Using Next.js 13+ with Client Components

// 'use client'; // This component must be a client component to use hooks like useSession, useRouter, usePathname

// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import Footer from "./components/Footer";
// import ClientOnly from "./components/ClientOnly";
// import Navbar from "./components/Navbar";
// import { ThemeProvider } from "@/context/ThemeProvider";
// import ThemedToaster from "./components/ThemedToaster";
// import { Providers } from "./components/Providers"; // This should wrap SessionProvider internally
// import { useSession } from 'next-auth/react'; // Import useSession
// import { usePathname, useRouter } from 'next/navigation'; // Import useRouter and usePathname
// import { useEffect } from 'react'; // Import useEffect

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// // metadata is a server-only export, so it stays outside the client component
// export const metadata = {
//   title: "STI-Policy | Helpdesk",
//   description: "Connecting you with the right help",
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

// export default function RootLayout({ children }) {
//   const { data: session, status } = useSession(); // Get session data and status
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     // Only proceed if session status is authenticated and session data exists
//     if (status === 'authenticated' && session?.user) {
//       // Check if forcePasswordChange is true AND the current path is NOT the change-password page
//       if (session.user.forcePasswordChange && pathname !== '/change-password') {
//         console.log("Redirecting to /change-password due to forcePasswordChange flag.");
//         router.push('/change-password');
//       }
//     }
//     // Also, if the user is on the change-password page but the flag is false,
//     // it means they've already changed it or the flag was never set, so redirect them away.
//     if (status === 'authenticated' && session?.user && !session.user.forcePasswordChange && pathname === '/change-password') {
//       console.log("Redirecting away from /change-password as forcePasswordChange is false.");
//       router.push('/dashboard'); // Or '/home', or '/submissions', etc. - your default authenticated landing page
//     }
//   }, [session, status, router, pathname]); // Depend on session, status, router, and pathname

//   return (
//     <html lang="en" data-theme="light">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <Providers> {/* `Providers` component should contain NextAuth's SessionProvider */}
//           <ThemeProvider>
//             <div className="flex flex-col min-h-screen">
//               {/* Navbar */}
//               <ClientOnly>
//                 <Navbar />
//               </ClientOnly>

//               {/* Toasts */}
//               <ClientOnly>
//                 <ThemedToaster />
//               </ClientOnly>

//               <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8">
//                 {children}
//               </main>

//               {/* Footer */}
//               <ClientOnly>
//                 <Footer />
//               </ClientOnly>
//             </div>
//           </ThemeProvider>
//         </Providers>
//       </body>
//     </html>
//   );
// }



// File: src/app/layout.js
import ClientLayout from './ClientLayout';

export const metadata = {
  title: "STI-Policy | Helpdesk",
  description: "Connecting you with the right help",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}