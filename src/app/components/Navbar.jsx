// File: src/app/components/Navbar.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHasMounted } from "@/hooks/useHasMounted";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  // const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
  const { data: session, status } = useSession();
  const currentUser = session?.user;

  const hasMounted = useHasMounted();
  // const [userRole, setUserRole] = useState(null);
  const userRole = currentUser?.role;

  const publicPaths = ["/login", "/sign-in"];

  if (status === "loading" || pathname === "/") return null;


  // const links = 
  //   status === "authenticated" && currentUser && !publicPaths.includes(pathname)
  //     ? [
  //         { href: "/submissions", label: "All Work Request" },
  //         ...(userRole === "COUNCIL"
  //           ? [
  //               { href: "/my-work-request", label: "My Work Request" },
  //               { href: "/expert-profiles", label: "Expert Profiles" },
  //             ]
  //           : []),
  //         ...(userRole === "EXPERT"
  //           ? [{ href: "/my-contracts", label: "My Contracts" }]
  //           : []),
  //         { href: "/my-profile", label: "My Profile" },
  //       ]
  //     : [];

  const links =
    status === "authenticated" && currentUser && !publicPaths.includes(pathname)
      ? [
          // Conditionally render based on role
          ...(userRole === "ADMIN" // Check if the user is an ADMIN
            ? [{ href: "/admin", label: "Admin Dashboard" }] // If ADMIN, show Admin Dashboard
            : [{ href: "/submissions", label: "All Work Request" }] // Otherwise, show All Work Request
          ),
          ...(userRole === "COUNCIL"
            ? [
                { href: "/my-work-request", label: "My Work Request" },
                { href: "/expert-profiles", label: "Expert Profiles" },
              ]
            : []),
          ...(userRole === "EXPERT"
            ? [{ href: "/my-contracts", label: "My Contracts" }]
            : []),
          { href: "/my-profile", label: "My Profile" },
        ]
      : [];


  return (
    <nav
      className={`py-1 transition duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-teal-50 text-gray-800"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center w-full my-2">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/images/acts-logo.png"
            alt="logo"
            width={60}
            height={30}
          />
          <h3 className="text-xl font-bold ml-3">STI Policy HelpDesk</h3>
        </Link>
      </div>

      {/* Top Row: Mobile controls */}
      <div className="flex justify-between items-center px-4">
        <button
          className="md:hidden text-gray-700 dark:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      

      {/* Links + Notifications */}
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between px-6 pb-4 md:pb-0 ${
          menuOpen ? "block" : "hidden md:flex"
        }`}
      >
        {/* Nav Links */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`capitalize font-semibold px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-gray-200 text-teal-800 dark:bg-gray-800 dark:text-teal-400"
                    : "hover:bg-gray-100 hover:text-teal-600 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Notifications - Far Right */}
        <div className="mt-4 md:mt-0 md:ml-auto flex justify-end">
          {hasMounted && currentUser && (
            <NotificationDropdown currentUser={currentUser} />
          )}

          {/* User Actions */}
          <div className="mt-4 md:mt-0 md:ml-4 flex items-center gap-4">
            {status === "loading" ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : currentUser ? (
              <>
                <span className="text-sm font-medium hidden md:block">
                  👋 {currentUser.name} ({currentUser.role})
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
