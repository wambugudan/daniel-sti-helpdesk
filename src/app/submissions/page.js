// // File: src/app/submissions/page.js
// // This component fetches and displays work requests.
// // It includes pagination, and a button to add new work requests.
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import DataCard from "../components/DataCard";
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import WorkRequestModal from "../components/WorkRequestModal";
// import { useTheme } from '@/context/ThemeProvider';
// import clsx from 'clsx';
// import { useHasMounted } from '@/hooks/useHasMounted';
// import { FaSpinner } from 'react-icons/fa';
// import FilterControls from '../components/FilterControls';



// const Submissions = () => {
//   const hasMounted = useHasMounted()
//   const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
//   const { data: session, status: sessionStatus } = useSession();
//   const router = useRouter();
  
//   const searchParams = useSearchParams();
//   const { theme } = useTheme();
  
//   const [workRequests, setWorkRequests] = useState([]);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [limit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);

//   const initialPage = parseInt(searchParams.get("page")) || 1;
//   const [page, setPage] = useState(initialPage);

//   const [redirecting, setRedirecting] = useState(false);

//   const [status, setStatus] = useState('ALL');
//   const [category, setCategory] = useState('ALL');
//   const [sortBy, setSortBy] = useState('newest');

//   // All for hydration
  
//   if (!hasMounted) return null;

//     // 1. Block rendering while checking auth
//   if (sessionStatus === "loading") {
//     return <div className="text-center py-20">Checking authentication...</div>;
//   }

//   // 2. If not authenticated, redirect
//   if (sessionStatus === "unauthenticated") {
//     router.push("/login"); // optional: replace with a toast or modal
//     return null;
//   }
  
//   useEffect(() => {
//     if (session) {
//       console.log("✅ User Role:", session.user.role);
//       console.log("✅ User ID:", session.user.id);
//     } else {
//       console.log("❌ Not logged in");
//     }
//   }, [session]);

//   // Sync URL with current page
//   useEffect(() => {
//     router.replace(`?page=${page}`);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, [page, router]);

//   useEffect(() => {
//     const fetchWorkRequests = async () => {
//       setLoading(true);
//       try {
//         const queryParams = new URLSearchParams({
//           page,
//           limit,
//           ...(status && { status }),
//           ...(category && { category }),
//           ...(sortBy && { sortBy }),
//         });

//         const res = await fetch(`/api/workRequests?${queryParams.toString()}`);

//         // const res = await fetch(`/api/workRequests?page=${page}&limit=${limit}`);
        
//         if (!res.ok) throw new Error("Failed to fetch work requests");

//         const { data, pagination } = await res.json();
//         setWorkRequests(data);
//         setTotalPages(pagination.totalPages);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching work requests:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWorkRequests();
//   }, [page, limit, status, category, sortBy]);


//   return (
//     <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
//       {error && <p className="text-red-500">Error: {error}</p>}


//       {/* Note for Council */}
//       {currentUser?.role === "COUNCIL" && (
//         <div 
//           // className={`mb-6 px-4 py-2 rounded-md border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 ${ theme === "dark" && "bg-blue-900 text-blue-100 transition-colors"}`}
//           className={clsx(
//             "mb-6 px-4 py-2 rounded-md",
//             theme === "dark"
//               ? "border-blue-700 bg-blue-900 text-blue-100"
//               : "border-blue-300 bg-blue-50 text-blue-800"
//           )}
//         >
//           💡 <strong>Note:</strong> Only <span className="font-semibold">open</span> work requests are shown here.
//           To view all your work requests, visit{" "}
//           <a
//             href="/my-work-request"
//             // className={`underline text-teal-600 hover:text-teal-900 ${ theme === "dark" && "text-teal-300 hover:text-teal-200 transition-colors"}`}
//             className={`underline ${
//               theme === "dark"
//                 ? "text-teal-300 hover:text-teal-200"
//                 : "text-teal-600 hover:text-teal-900"
//             }`}
//           >
//             My Work Requests
//           </a>.
//         </div>
//       )}

//       <FilterControls
//         status={status}
//         setStatus={setStatus}
//         category={category}
//         setCategory={setCategory}
//         sortBy={sortBy}
//         setSortBy={setSortBy}
//       />


//       {/* Add Work Request Button */}
//       {currentUser.role === 'COUNCIL' && (
//         <div className="flex justify-end mb-6">
          
//           <button
//             onClick={async () => {
//               setRedirecting(true);
//               await new Promise(resolve => setTimeout(resolve, 100)); // Optional: delay for animation
//               router.push('/new-work-request');
//             }}
//             disabled={redirecting}
//             className={clsx(
//               "font-medium px-6 py-2 rounded-md shadow-md transition duration-300",
//               redirecting
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-primary hover:bg-primary-dark text-white"
//             )}
//           >
            
//             {redirecting ? (
//               <div className="flex items-center gap-2">
//                 <FaSpinner className="animate-spin" />
//                 Loading...
//               </div>
//             ) : (
//               "+ Add New Work Request"
//             )}
//           </button>

//         </div>
//       )}


//       {/* Work Requests */}
//       {loading ? (
//         <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
//       ) : workRequests.length === 0 ? (
//         currentUser.role === "COUNCIL" ? (
//           <p className="text-center text-gray-600 mt-10">
//             You have no <strong>open</strong> work requests at the moment.
//             <br />
//             Go to{" "}
//             <a href="/my-work-request" className="underline text-blue-600 hover:text-blue-500">
//               My Work Requests
//             </a>{" "}
//             to view all your submissions.
//           </p>
//         ) : (
//           <p className="text-center text-gray-600 mt-10">No work requests available.</p>
//         )
//       ) : (
//         <div className="grid grid-cols-1 gap-8">
//           {workRequests.map(request => (
//             <DataCard
//               key={request.id}
//               workRequest={request}
//               currentUser={currentUser}
//               onView={async (req) => {
//                 const res = await fetch(`/api/work-request/${req.id}`, {
//                   headers: { 'x-user-id': currentUser.id },
//                 });
//                 const fullRequest = await res.json();
//                 setSelectedRequest(fullRequest);
//               }}
//             />
//           ))}
//         </div>
//       )}


//       {/* Pagination Controls */}
//       <div className="flex items-center justify-between mt-10">
//         <button
//           onClick={() => setPage(prev => Math.max(prev - 1, 1))}
//           disabled={page <= 1}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
//         >
//           Previous
//         </button>

//         <div className="flex items-center gap-2">
//           <span className="text-sm">Page</span>
//           <input
//             type="number"
//             value={page}
//             onChange={(e) => {
//               const val = parseInt(e.target.value);
//               if (!isNaN(val) && val > 0 && val <= totalPages) {
//                 setPage(val);
//               }
//             }}
//             className="w-16 border rounded px-2 py-1 text-center"
//           />
//           <span className="text-sm">of {totalPages || 1}</span>
//         </div>

//         <button
//           onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
//           disabled={page >= totalPages}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>

//       {/* Modal */}
//       {selectedRequest && (
//         <WorkRequestModal
//           workRequest={selectedRequest}
//           currentUser={currentUser}
//           onClose={() => setSelectedRequest(null)}
//           onDeleted={(id) => {
//             setWorkRequests(prev => prev.filter(req => req.id !== id));
//             setSelectedRequest(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Submissions;



// 'use client';

// import { useState, useEffect, useMemo } from 'react'; // Added useMemo as it's in your hook list
// import { useSession } from 'next-auth/react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import DataCard from "../components/DataCard";
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import WorkRequestModal from "../components/WorkRequestModal";
// import { useTheme } from '@/context/ThemeProvider';
// import clsx from 'clsx';
// import { useHasMounted } from '@/hooks/useHasMounted';
// import { FaSpinner } from 'react-icons/fa';
// import FilterControls from '../components/FilterControls';

// const Submissions = () => {
//   // --- ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE VERY TOP ---
//   // These calls must happen on every single render, in the same order.
//   const hasMounted = useHasMounted(); // Hook 1
//   const { currentUser, setCurrentUser, allUsers } = useCurrentUser(); // Hook 2 (useContext)
//   const { data: session, status: sessionStatus } = useSession(); // Hook 3 (useContext)
//   const router = useRouter(); // Hook 4 (useRouter uses useContext)
//   const searchParams = useSearchParams(); // Hook 5 (useSearchParams uses useContext)
//   const { theme } = useTheme(); // Hook 6 (useContext)

//   const [workRequests, setWorkRequests] = useState([]); // Hook 7
//   const [selectedRequest, setSelectedRequest] = useState(null); // Hook 8
//   const [error, setError] = useState(null); // Hook 9
//   const [loading, setLoading] = useState(false); // Hook 10

//   const [limit] = useState(5); // Hook 11
  
//   // Note: useState with an initial function (like below) is okay, it only runs once
//   const [totalPages, setTotalPages] = useState(1); // Hook 12

//   // Initializing page from searchParams needs to be handled carefully with hydration.
//   // It's often safer to initialize from searchParams in a useEffect or useMemo
//   // but if it's always available or a default is fine, useState is okay.
//   // Given your error, initializing with `searchParams.get` directly in useState
//   // might be problematic if searchParams is not immediately available or
//   // if `initialPage` changes between renders, leading to a re-initialization.
//   // Let's keep it for now but be aware.
//   const initialPage = parseInt(searchParams.get("page")) || 1;
//   const [page, setPage] = useState(initialPage); // Hook 13

//   const [redirecting, setRedirecting] = useState(false); // Hook 14

//   const [status, setStatus] = useState('ALL'); // Hook 15
//   const [category, setCategory] = useState('ALL'); // Hook 16
//   const [sortBy, setSortBy] = useState('newest'); // Hook 17

//   // Add any other hooks present in your list, e.g., useMemo
//   // For example, if you have a memoized value:
//   const memoizedValue = useMemo(() => {
//     // some expensive calculation or object creation
//     return { someKey: 'someValue' };
//   }, []); // Hook 18 (if you actually have one)


//   // --- All useEffects must also be declared unconditionally ---
//   useEffect(() => { // Hook 19
//     if (session) {
//       console.log("✅ User Role:", session.user.role);
//       console.log("✅ User ID:", session.user.id);
//     } else {
//       console.log("❌ Not logged in");
//     }
//   }, [session]);

//   useEffect(() => { // Hook 20
//     if (hasMounted) { // Only run this effect after hydration
//       router.replace(`?page=${page}`);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   }, [page, router, hasMounted]); // Add hasMounted to dependency array

//   useEffect(() => { // Hook 21
//     // Only fetch data after the component has mounted and session is loaded
//     if (!hasMounted || sessionStatus === "loading" || sessionStatus === "unauthenticated") {
//         return; // Don't fetch if not mounted or session isn't ready
//     }

//     const fetchWorkRequests = async () => {
//       setLoading(true);
//       try {
//         const queryParams = new URLSearchParams({
//           page,
//           limit,
//           ...(status !== 'ALL' && { status }), // Only add to query if not 'ALL'
//           ...(category !== 'ALL' && { category }), // Only add to query if not 'ALL'
//           ...(sortBy && { sortBy }),
//         });

//         const res = await fetch(`/api/workRequests?${queryParams.toString()}`);
        
//         if (!res.ok) throw new Error("Failed to fetch work requests");

//         const { data, pagination } = await res.json();
//         setWorkRequests(data);
//         setTotalPages(pagination.totalPages);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching work requests:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWorkRequests();
//   }, [page, limit, status, category, sortBy, hasMounted, sessionStatus]); // Add hasMounted, sessionStatus to dependencies

//   // --- Now, handle your conditional rendering based on state ---
//   // You now render different JSX, but all hooks have already been called.

//   if (sessionStatus === "loading") {
//     return <div className="text-center py-20">Checking authentication...</div>;
//   }

//   if (sessionStatus === "unauthenticated") {
//     // Use an effect for side effects like redirection
//     // This is generally better than direct `router.push` in render
//     useEffect(() => {
//       router.push("/login");
//     }, [router]);
//     return null; // Or a loading spinner while redirecting
//   }

//   // If the component hasn't truly mounted on the client yet,
//   // return a placeholder or null *after* all hooks have been declared.
//   // This ensures the hook order is consistent.
//   if (!hasMounted) {
//     // You could return a loading spinner here if you want to show something
//     // instead of just `null`.
//     return <div className="text-center py-20">Loading component...</div>;
//   }


//   return (
//     <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
//       {error && <p className="text-red-500">Error: {error}</p>}

//       {/* Note for Council */}
//       {currentUser?.role === "COUNCIL" && (
//         <div 
//           className={clsx(
//             "mb-6 px-4 py-2 rounded-md",
//             theme === "dark"
//               ? "border-blue-700 bg-blue-900 text-blue-100"
//               : "border-blue-300 bg-blue-50 text-blue-800"
//           )}
//         >
//           💡 <strong>Note:</strong> Only <span className="font-semibold">open</span> work requests are shown here.
//           To view all your work requests, visit{" "}
//           <a
//             href="/my-work-request"
//             className={`underline ${
//               theme === "dark"
//                 ? "text-teal-300 hover:text-teal-200"
//                 : "text-teal-600 hover:text-teal-900"
//             }`}
//           >
//             My Work Requests
//           </a>.
//         </div>
//       )}

//       <FilterControls
//         status={status}
//         setStatus={setStatus}
//         category={category}
//         setCategory={setCategory}
//         sortBy={sortBy}
//         setSortBy={setSortBy}
//       />


//       {/* Add Work Request Button */}
//       {currentUser.role === 'COUNCIL' && (
//         <div className="flex justify-end mb-6">
          
//           <button
//             onClick={async () => {
//               setRedirecting(true);
//               await new Promise(resolve => setTimeout(resolve, 100)); // Optional: delay for animation
//               router.push('/new-work-request');
//             }}
//             disabled={redirecting}
//             className={clsx(
//               "font-medium px-6 py-2 rounded-md shadow-md transition duration-300",
//               redirecting
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-primary hover:bg-primary-dark text-white"
//             )}
//           >
            
//             {redirecting ? (
//               <div className="flex items-center gap-2">
//                 <FaSpinner className="animate-spin" />
//                 Loading...
//               </div>
//             ) : (
//               "+ Add New Work Request"
//             )}
//           </button>

//         </div>
//       )}


//       {/* Work Requests */}
//       {loading ? (
//         <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
//       ) : workRequests.length === 0 ? (
//         currentUser.role === "COUNCIL" ? (
//           <p className="text-center text-gray-600 mt-10">
//             You have no <strong>open</strong> work requests at the moment.
//             <br />
//             Go to{" "}
//             <a href="/my-work-request" className="underline text-blue-600 hover:text-blue-500">
//               My Work Requests
//             </a>{" "}
//             to view all your submissions.
//           </p>
//         ) : (
//           <p className="text-center text-gray-600 mt-10">No work requests available.</p>
//         )
//       ) : (
//         <div className="grid grid-cols-1 gap-8">
//           {workRequests.map(request => (
//             <DataCard
//               key={request.id}
//               workRequest={request}
//               currentUser={currentUser}
//               onView={async (req) => {
//                 const res = await fetch(`/api/work-request/${req.id}`, {
//                   headers: { 'x-user-id': currentUser.id },
//                 });
//                 const fullRequest = await res.json();
//                 setSelectedRequest(fullRequest);
//               }}
//             />
//           ))}
//         </div>
//       )}


//       {/* Pagination Controls */}
//       <div className="flex items-center justify-between mt-10">
//         <button
//           onClick={() => setPage(prev => Math.max(prev - 1, 1))}
//           disabled={page <= 1}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
//         >
//           Previous
//         </button>

//         <div className="flex items-center gap-2">
//           <span className="text-sm">Page</span>
//           <input
//             type="number"
//             value={page}
//             onChange={(e) => {
//               const val = parseInt(e.target.value);
//               if (!isNaN(val) && val > 0 && val <= totalPages) {
//                 setPage(val);
//               }
//             }}
//             className="w-16 border rounded px-2 py-1 text-center"
//           />
//           <span className="text-sm">of {totalPages || 1}</span>
//         </div>

//         <button
//           onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
//           disabled={page >= totalPages}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>

//       {/* Modal */}
//       {selectedRequest && (
//         <WorkRequestModal
//           workRequest={selectedRequest}
//           currentUser={currentUser}
//           onClose={() => setSelectedRequest(null)}
//           onDeleted={(id) => {
//             setWorkRequests(prev => prev.filter(req => req.id !== id));
//             setSelectedRequest(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Submissions;



// File: src/app/submissions/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataCard from "../components/DataCard";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import WorkRequestModal from "../components/WorkRequestModal";
import { useTheme } from '@/context/ThemeProvider';
import clsx from 'clsx';
import { useHasMounted } from '@/hooks/useHasMounted';
import { FaSpinner } from 'react-icons/fa';
import FilterControls from '../components/FilterControls';

const Submissions = () => {
  // --- ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE VERY TOP ---
  const hasMounted = useHasMounted();
  const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const [workRequests, setWorkRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Derive initial page from searchParams, use useMemo for stability if needed,
  // but for a simple parseInt, direct is fine as long as `searchParams` is stable.
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);

  const [redirecting, setRedirecting] = useState(false);

  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // If you have a useMemo as indicated in the error analysis:
  const memoizedValue = useMemo(() => {
    // some expensive calculation or object creation
    return { someKey: 'someValue' };
  }, []);


  // --- Effects for side actions and data fetching ---

  // Effect for logging session status (this is fine, doesn't guard rendering)
  useEffect(() => {
    if (session) {
      console.log("✅ User Role:", session.user.role);
      console.log("✅ User ID:", session.user.id);
    } else {
      console.log("❌ Not logged in");
    }
  }, [session]);

  // Effect for redirecting unauthenticated users
  // This is crucial: Perform the redirect *as a side effect* when status changes.
  useEffect(() => {
    if (hasMounted && sessionStatus === "unauthenticated") {
      // Use replace to prevent going back to a protected page after logout
      router.replace("/login");
    }
  }, [hasMounted, sessionStatus, router]); // Dependencies: only run when these change


  // Effect for syncing URL with current page
  useEffect(() => {
    if (hasMounted) {
      router.replace(`?page=${page}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, router, hasMounted]);

  // Effect for fetching work requests
  useEffect(() => {
    // Only fetch if mounted AND authenticated.
    // This prevents fetching during initial load, unauthenticated state, or logout transition.
    if (!hasMounted || sessionStatus !== "authenticated") {
      // If we are not mounted or not authenticated, don't proceed with fetching.
      // Resetting workRequests can also help clear stale data on logout.
      if (workRequests.length > 0) { // Only clear if there's data to clear
         setWorkRequests([]);
         setTotalPages(1);
      }
      return;
    }

  const fetchWorkRequests = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        status: 'OPEN', // force status to OPEN here
        ...(category !== 'ALL' && { category }),
        ...(sortBy && { sortBy }),
      });

      const res = await fetch(`/api/workRequests?${queryParams.toString()}`);

      if (!res.ok) throw new Error("Failed to fetch work requests");

      const { data, pagination } = await res.json();
      setWorkRequests(data);
      setTotalPages(pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error("Error fetching work requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    };

    fetchWorkRequests();
  }, [page, limit, category, sortBy, hasMounted, sessionStatus]);



  // --- Conditional Rendering based on state and authentication ---

  // Display a loading message while authentication status is being determined
  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  // Display a loading message while redirecting after logout
  // This helps bridge the gap before the router pushes to /login
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  // Display a loading message during initial client-side mount (hydration)
  // This ensures the component always renders *something* after hooks are called.
  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Loading component...</p>
      </div>
    );
  }

  // Main component rendering for authenticated users
  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Note for Council */}
      {currentUser?.role === "COUNCIL" && (
        <div 
          className={clsx(
            "mb-6 px-4 py-2 rounded-md",
            theme === "dark"
              ? "border-blue-700 bg-blue-900 text-blue-100"
              : "border-blue-300 bg-blue-50 text-blue-800"
          )}
        >
          💡 <strong>Note:</strong> Only <span className="font-semibold">open</span> work requests are shown here.
          To view all your work requests, visit{" "}
          <a
            href="/my-work-request"
            className={`underline ${
              theme === "dark"
                ? "text-teal-300 hover:text-teal-200"
                : "text-teal-600 hover:text-teal-900"
            }`}
          >
            My Work Requests
          </a>.
        </div>
      )}

      <FilterControls
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Add Work Request Button */}
      {currentUser.role === 'COUNCIL' && (
        <div className="flex justify-end mb-6">
          <button
            onClick={async () => {
              setRedirecting(true);
              await new Promise(resolve => setTimeout(resolve, 100));
              router.push('/new-work-request');
            }}
            disabled={redirecting}
            className={clsx(
              "font-medium px-6 py-2 rounded-md shadow-md transition duration-300",
              redirecting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark text-white"
            )}
          >
            {redirecting ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                Loading...
              </div>
            ) : (
              "+ Add New Work Request"
            )}
          </button>
        </div>
      )}

      {/* Work Requests */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
      ) : workRequests.length === 0 ? (
        currentUser.role === "COUNCIL" ? (
          <p className="text-center text-gray-600 mt-10">
            You have no <strong>open</strong> work requests at the moment.
            <br />
            Go to{" "}
            <a href="/my-work-request" className="underline text-blue-600 hover:text-blue-500">
              My Work Requests
            </a>{" "}
            to view all your submissions.
          </p>
        ) : (
          <p className="text-center text-gray-600 mt-10">No work requests available.</p>
        )
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {workRequests.map(request => (
            <DataCard
              key={request.id}
              workRequest={request}
              currentUser={currentUser}
              onView={async (req) => {
                const res = await fetch(`/api/work-request/${req.id}`, {
                  headers: { 'x-user-id': currentUser.id },
                });
                const fullRequest = await res.json();
                setSelectedRequest(fullRequest);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page <= 1}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm">Page</span>
          <input
            type="number"
            value={page}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val > 0 && val <= totalPages) {
                setPage(val);
              }
            }}
            className="w-16 border rounded px-2 py-1 text-center"
          />
          <span className="text-sm">of {totalPages || 1}</span>
        </div>

        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {selectedRequest && (
        <WorkRequestModal
          workRequest={selectedRequest}
          currentUser={currentUser}
          onClose={() => setSelectedRequest(null)}
          onDeleted={(id) => {
            setWorkRequests(prev => prev.filter(req => req.id !== id));
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default Submissions;