import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import ClientOnly from "./components/ClientOnly";
import Navbar from "./components/Navbar"; // Import Navbar component
import { ThemeProvider } from "@/context/ThemeProvider"; // Import ThemeProvider
import { Toaster } from "react-hot-toast";
import { useTheme } from "@/context/ThemeProvider"; // Import useTheme

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  // const { currentUser } = useCurrentUser();
  return (
    // <html lang="en">
    <html lang="en" data-theme="light">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider> {/* 🔹 Wrap app inside ThemeProvider */}
          <div className="flex flex-col min-h-screen">

            {/*  Navbar */}
            {/* Wraping with ClientOnly to allow for hydration */}
            <ClientOnly>
              <Navbar />
            </ClientOnly>   

            {/* Toasts */}
            <ClientOnly>
              <Toaster position="top-center" reverseOrder={false} />
              {/* <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    borderRadius: '8px',
                    background: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                  },
                }}
              /> */}
            </ClientOnly>         
            
            <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8">
              {children}
            </main> 
            
            {/* Footer */}
            {/* Wraping with ClientOnly to allow for hydration */}
            <ClientOnly>
              <Footer />
            </ClientOnly>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
