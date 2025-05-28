// // File: src/app/components/Navbar.jsx
// // Description: This is a responsive navigation bar component. 
// // It includes links to various sections of the app, a theme toggle button, and a dropdown menu for notifications based on user roles. 
// // The component uses React hooks for state management and Next.js for routing and image handling.

// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { useState, useEffect } from "react";
// import { Menu, X, Moon, Sun, Bell } from "lucide-react";
// import { usePathname } from "next/navigation";
// import { useTheme } from "@/context/ThemeProvider";
// import NotificationDropdown from "./NotificationDropdown";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { useHasMounted } from "@/hooks/useHasMounted";

// const Navbar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const pathname = usePathname();
//   const { theme, toggleTheme } = useTheme();
//   // const { currentUser } = useCurrentUser();
//   const [userRole, setUserRole] = useState(null);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
//   const hasMounted = useHasMounted(); // to prevent hydration mismatch


//   useEffect(() => {
//     setUserRole(currentUser?.role);
//   }, [currentUser]);

//   if (!currentUser || pathname === "/") return null;

//   // Notification counts
//   const councilSubLinks = [
//     { href: "/invites", label: "invites", badge: 3 },
//     { href: "/bids", label: "bidded projects", badge: 5 },
//   ];
//   const expertSubLinks = [
//     { href: "/my-invites", label: "my invites", badge: 2 },
//     { href: "/my-bids", label: "my bids", badge: 4 },
//   ];

//   const notificationSubLinks = userRole === "COUNCIL" ? councilSubLinks : userRole === "EXPERT" ? expertSubLinks : [];
//   const totalNotifications = notificationSubLinks.reduce((sum, sub) => sum + sub.badge, 0);

//   const links = [
//     { href: "/submissions", label: "all work request" },
//     ...(userRole === "COUNCIL"
//       ? [
//           { href: "/my-work-request", label: "my work request" },
//           { href: "/expert-profiles", label: "expert profiles" },
//         ]
//       : []),
//     ...(userRole === "EXPERT"
//       ? 
//       [
//         { href: "/my-contracts", label: "my contracts" },
//       ]
//       : []),
//     // {
//     //   label: "notifications",
//     //   subLinks: notificationSubLinks,
//     //   badge: totalNotifications,
//     // },    
//     { href: "/my-profile", label: "my profile" },
//   ];

//   return (
//     <nav
//       className={`py-1 transition duration-300 ${
//         theme === "dark" ? "bg-gray-900 text-white" : "bg-teal-50 text-gray-800"
//       }`}
//     >
//       {/* Logo */}
//       <div className="flex items-center justify-center w-full my-2">
//         <Link href="/" className="flex items-center">
//           <Image src="/assets/images/acts-logo.png" alt="logo" width={60} height={30} />
//           <h3 className="text-xl font-bold ml-3">STI Policy HelpDesk</h3>
//         </Link>
//       </div>

//       {/* Mobile Menu & Theme Toggle */}
//       <div className="flex justify-between items-center px-4">
//         <button
//           className="md:hidden text-gray-700 dark:text-white"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           {menuOpen ? <X size={28} /> : <Menu size={28} />}
//         </button>

//         <button
//           onClick={toggleTheme}
//           className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//         >
//           {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
//         </button>
//       </div>


//       {/* 🔁 Switch User Dropdown (only in development or mock mode) */}
//       {hasMounted && (
//         <div className="my-4 md:my-0 md:ml-auto">
//           <label className="text-sm mr-2 font-medium">Switch User:</label>
//           <select
//             className="border px-3 py-1 rounded text-sm"
//             value={currentUser?.id}
//             onChange={(e) => {
//               const selected = allUsers.find((user) => user.id === e.target.value);
//               if (selected) setCurrentUser(selected);
//             }}
//           >
//             {allUsers.map((user) => (
//               <option key={user.id} value={user.id}>
//                 {user.name} ({user.role})
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Notifications Dropdown */}
//       {hasMounted && currentUser && (
//         <div className="ml-auto px-4">
//           <NotificationDropdown currentUser={currentUser} />
//         </div>
//       )}


//       {/* Links */}
//       <div
//         className={`${
//           menuOpen ? "flex" : "hidden"
//         } flex-col md:flex md:flex-row md:justify-center md:items-center md:space-x-8 px-6 pb-4 md:pb-0`}
//       >
//         {links.map((link, index) => {
//           if (link.subLinks) {
//             return (            
//             <div
//                 key={index}
//                 className="relative"
//                 onMouseEnter={() => setShowDropdown(true)}
//                 onMouseLeave={() => setShowDropdown(false)}
//                 >
//                 {/* Trigger */}
//                 <button
//                     onClick={() => setShowDropdown((prev) => !prev)}
//                     className="capitalize font-semibold px-4 py-2 rounded-md transition flex items-center gap-2
//                             hover:text-teal-600 dark:hover:text-teal-400 
//                             hover:bg-gray-100 dark:hover:bg-gray-700 relative"
//                 >
//                     <Bell size={18} />
//                     {link.label}
//                     {link.badge > 0 && (
//                     <span className="absolute -top-1 -right-2 text-xs bg-red-600 text-white rounded-full px-1.5">
//                         {link.badge}
//                     </span>
//                     )}
//                 </button>

//                 {/* Dropdown: NO margin between button & dropdown */}
//                 {showDropdown && (
//                     <div
//                     className="absolute left-0 top-full w-max bg-white dark:bg-gray-800 rounded-md shadow-lg z-50"
//                     >
//                     {link.subLinks.map((sub) => (
//                         <Link
//                         key={sub.href}
//                         href={sub.href}
//                         className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 dark:text-white
//                                     hover:bg-gray-100 dark:hover:bg-gray-700 
//                                     hover:text-teal-600 dark:hover:text-teal-300"
//                         >
//                         <span>{sub.label}</span>
//                         {sub.badge > 0 && (
//                             <span className="ml-2 text-xs bg-red-500 dark:bg-red-600 text-white rounded-full px-2 py-0.5">
//                             {sub.badge}
//                             </span>
//                         )}
//                         </Link>
//                     ))}
//                     </div>
//                 )}
//             </div>

           
//         );
//           } else {
//             const isActive = pathname === link.href;
//             return (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className={`capitalize font-semibold px-4 py-2 rounded-md transition ${
//                   isActive
//                     ? "bg-gray-200 text-teal-800 dark:bg-gray-800 dark:text-teal-400"
//                     : "hover:bg-gray-100 hover:text-teal-600 dark:hover:bg-gray-700 dark:hover:text-teal-300"
//                 }`}
//               >
//                 {link.label}
//               </Link>
//             );
//           }
//         })}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


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


  const links = 
    status === "authenticated" && currentUser && !publicPaths.includes(pathname)
      ? [
          { href: "/submissions", label: "All Work Request" },
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
