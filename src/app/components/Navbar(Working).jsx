// // Description: This is a responsive navigation bar component for a Next.js application. It includes links to various pages, a logo, and a dark mode toggle button. The component uses the Lucide React library for icons and the Next.js Link component for navigation. The theme is managed using a custom ThemeProvider context.
// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { useState } from "react";
// import { Menu, X, Moon, Sun } from "lucide-react";
// import { usePathname } from "next/navigation";
// import { useTheme } from "@/context/ThemeProvider"; // Import useTheme hook


// const links = [
//   { href: "/submissions", label: "all work request" },
//   { href: "/my-work-request", label: "my work request" },
//   { href: "/expert-profile", label: "expert profile" },
//   { href: "/my-invites", label: "my invites" },
//   { href: "/bidded-projects", label: "bidded projects" },
// ];

// const Navbar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const pathname = usePathname();

//   const { theme, toggleTheme } = useTheme(); // Get theme state and toggle function

//   if (pathname === "/") return null;

//   return (
//     <nav
//       className={`py-1 transition duration-300 ${
//         theme === "dark" ? "bg-gray-900 text-white" : "bg-teal-50 text-gray-800"
//       }`}
//     >
    
//       {/* Logo Section */}
//       <div className="flex items-center justify-center w-full my-2">
//         <Link href="/" className="flex items-center">
//           <Image
//             src="/assets/images/acts-logo.png"
//             loading="lazy"
//             alt="logo"
//             width={60}
//             height={30}
//           />
//           <h3 className="text-xl font-bold ml-3">STI Policy HelpDesk</h3>
//         </Link>
//       </div>



//       {/* Navbar Container */}
//       <div className="flex justify-between items-center px-4">
//         {/* Mobile Menu Button */}
//         <button
//           className="md:hidden text-gray-700 dark:text-white"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           {menuOpen ? <X size={28} /> : <Menu size={28} />}
//         </button>

//         {/* Dark Mode Toggle Button */}
//         <button
//           onClick={toggleTheme}
//           className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
//         >
//           {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
//         </button>
//       </div>

//       {/* Menu Links */}
//       <div
//         className={`${
//           menuOpen ? "flex" : "hidden"
//         } flex-col md:flex md:flex-row md:justify-center md:items-center md:space-x-8 px-6 pb-4 md:pb-0`}
//       >
//         {links.map((link) => {
//           const isActive = pathname === link.href;
//           return (
//             <Link
//               key={link.href}
//               href={link.href}
//               className={`capitalize font-semibold px-4 py-2 rounded-md transition ${
//                 isActive
//                   ? "bg-gray-200 text-teal-800 dark:bg-gray-800 dark:text-teal-400"
//                   : "hover:bg-gray-100 hover:text-teal-600 dark:hover:bg-gray-700 dark:hover:text-teal-300"
//               }`}
//             >
//               {link.label}
//             </Link>
//           );
//         })}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



// // "use client";

// // import Link from "next/link";
// // import Image from "next/image";
// // import { useState, useEffect } from "react";
// // import { Menu, X, Moon, Sun } from "lucide-react";
// // import { usePathname } from "next/navigation";
// // import { useTheme } from "@/context/ThemeProvider";
// // import { useCurrentUser } from "@/hooks/useCurrentUser";


// // // Navbar component
// // // This component renders a responsive navigation bar with links based on user roles and a dark mode toggle.
// // const Navbar = () => {
// //   const [menuOpen, setMenuOpen] = useState(false);
// //   const pathname = usePathname();
// //   const { theme, toggleTheme } = useTheme();
// //   const { currentUser } = useCurrentUser();
// //   const [userRole, setUserRole] = useState(currentUser?.role);


// //   useEffect(() => {
// //     setUserRole(currentUser?.role);
// //   }, [currentUser]);

// //   console.log("Current User Role:", userRole);
// //   console.log("Current User:", currentUser);
  
// //   // if (pathname === "/") return null;
// //   if (!currentUser || pathname === "/") return null;

// //   // Dynamically build links based on role
// //   const links = [
// //     { href: "/submissions", label: "all work request" },
// //     ...(userRole === "COUNCIL"
// //       ? [{ href: "/my-work-request", label: "my work request" }]
// //       : []),
// //     ...(userRole === "EXPERT"
// //       ? [
// //           { href: "/expert-profile", label: "expert profile" },
// //           { href: "/my-invites", label: "my invites" },
// //           { href: "/bidded-projects", label: "bidded projects" },
// //         ]
// //       : []),
// //   ];

// //   return (
// //     <nav
// //       className={`py-1 transition duration-300 ${
// //         theme === "dark" ? "bg-gray-900 text-white" : "bg-teal-50 text-gray-800"
// //       }`}
// //     >
// //       {/* Logo Section */}
// //       <div className="flex items-center justify-center w-full my-2">
// //         <Link href="/" className="flex items-center">
// //           <Image
// //             src="/assets/images/acts-logo.png"
// //             loading="lazy"
// //             alt="logo"
// //             width={60}
// //             height={30}
// //           />
// //           <h3 className="text-xl font-bold ml-3">STI Policy HelpDesk</h3>
// //         </Link>
// //       </div>

// //       {/* Navbar Container */}
// //       <div className="flex justify-between items-center px-4">
// //         {/* Mobile Menu Button */}
// //         <button
// //           className="md:hidden text-gray-700 dark:text-white"
// //           onClick={() => setMenuOpen(!menuOpen)}
// //         >
// //           {menuOpen ? <X size={28} /> : <Menu size={28} />}
// //         </button>

// //         {/* Dark Mode Toggle */}
// //         <button
// //           onClick={toggleTheme}
// //           className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
// //         >
// //           {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
// //         </button>
// //       </div>

// //       {/* Navigation Links */}
// //       <div
// //         className={`${
// //           menuOpen ? "flex" : "hidden"
// //         } flex-col md:flex md:flex-row md:justify-center md:items-center md:space-x-8 px-6 pb-4 md:pb-0`}
// //       >
// //         {links.map((link) => {
// //           const isActive = pathname === link.href;
// //           return (
// //             <Link
// //               key={link.href}
// //               href={link.href}
// //               className={`capitalize font-semibold px-4 py-2 rounded-md transition ${
// //                 isActive
// //                   ? "bg-gray-200 text-teal-800 dark:bg-gray-800 dark:text-teal-400"
// //                   : "hover:bg-gray-100 hover:text-teal-600 dark:hover:bg-gray-700 dark:hover:text-teal-300"
// //               }`}
// //             >
// //               {link.label}
// //             </Link>
// //           );
// //         })}
// //       </div>
// //     </nav>
// //   );
// // };

// // export default Navbar;


// // "use client";

// // import Link from "next/link";
// // import Image from "next/image";
// // import { useState } from "react";
// // import { Menu, X, Moon, Sun } from "lucide-react";
// // import { usePathname } from "next/navigation";
// // import { useTheme } from "@/context/ThemeProvider";

// // const Navbar = ({ currentUser }) => {
// //   const [menuOpen, setMenuOpen] = useState(false);
// //   const pathname = usePathname();
// //   const { theme, toggleTheme } = useTheme();

// //   if (!currentUser || pathname === "/") return null;

// //   const role = currentUser.role;

// //   const links = [
// //     { href: "/submissions", label: "all work request" },
// //     ...(role === "COUNCIL"
// //       ? [{ href: "/my-work-request", label: "my work request" }]
// //       : []),
// //     ...(role === "EXPERT"
// //       ? [
// //           { href: "/expert-profile", label: "expert profile" },
// //           { href: "/my-invites", label: "my invites" },
// //           { href: "/bidded-projects", label: "bidded projects" },
// //         ]
// //       : []),
// //   ];

// //   return (
// //     <nav
// //       className={`py-1 transition duration-300 ${
// //         theme === "dark" ? "bg-gray-900 text-white" : "bg-teal-50 text-gray-800"
// //       }`}
// //     >
// //       {/* Logo */}
// //       <div className="flex items-center justify-center w-full my-2">
// //         <Link href="/" className="flex items-center">
// //           <Image src="/assets/images/acts-logo.png" alt="logo" width={60} height={30} />
// //           <h3 className="text-xl font-bold ml-3">STI Policy HelpDesk</h3>
// //         </Link>
// //       </div>

// //       {/* Mobile Menu & Theme Toggle */}
// //       <div className="flex justify-between items-center px-4">
// //         <button
// //           className="md:hidden text-gray-700 dark:text-white"
// //           onClick={() => setMenuOpen(!menuOpen)}
// //         >
// //           {menuOpen ? <X size={28} /> : <Menu size={28} />}
// //         </button>

// //         <button
// //           onClick={toggleTheme}
// //           className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
// //         >
// //           {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
// //         </button>
// //       </div>

// //       {/* Links */}
// //       <div
// //         className={`${
// //           menuOpen ? "flex" : "hidden"
// //         } flex-col md:flex md:flex-row md:justify-center md:items-center md:space-x-8 px-6 pb-4 md:pb-0`}
// //       >
// //         {links.map((link) => {
// //           const isActive = pathname === link.href;
// //           return (
// //             <Link
// //               key={link.href}
// //               href={link.href}
// //               className={`capitalize font-semibold px-4 py-2 rounded-md transition ${
// //                 isActive
// //                   ? "bg-gray-200 text-teal-800 dark:bg-gray-800 dark:text-teal-400"
// //                   : "hover:bg-gray-100 hover:text-teal-600 dark:hover:bg-gray-700 dark:hover:text-teal-300"
// //               }`}
// //             >
// //               {link.label}
// //             </Link>
// //           );
// //         })}
// //       </div>
// //     </nav>
// //   );
// // };

// // export default Navbar;


