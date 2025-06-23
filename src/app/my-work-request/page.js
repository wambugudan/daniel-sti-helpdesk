// // File: src/app/my-work-request/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import DataCard from "../components/DataCard";
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import WorkRequestModal from "../components/WorkRequestModal";
// import { FaSpinner } from 'react-icons/fa';
// import clsx from "clsx";
// import FilterControls from '../components/FilterControls';
// import { useHasMounted } from '@/hooks/useHasMounted';
// import { useTheme } from '@/context/ThemeProvider';

// // Custom hook for debouncing a value
// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// };


// const MyWorkRequest = () => {
//   const hasMounted = useHasMounted();
//   const { currentUser } = useCurrentUser();
//   const { data: session, status: sessionStatus } = useSession();

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { theme } = useTheme();

//   const [workRequests, setWorkRequests] = useState([]);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [redirecting, setRedirecting] = useState(false);

//   const [limit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const initialPage = parseInt(searchParams.get("page")) || 1;
//   const [page, setPage] = useState(initialPage);

//   const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
//   const debouncedSearchTerm = useDebounce(searchTerm, 500);

//   const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
//   const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
//   const [sortByField, setSortByField] = useState(searchParams.get('sortByField') || 'createdAt');
//   const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

//   const statusOptions = [
//     { value: 'ALL', label: 'All' },
//     { value: 'OPEN', label: 'Open' },
//     { value: 'IN_PROGRESS', label: 'In Progress' },
//     { value: 'CLOSED', label: 'Closed' },
//     // If you have 'CANCELLED' in your Prisma enum:
//     // { value: 'CANCELLED', label: 'Cancelled' },
//   ];

//   const availableCategories = ['Design', 'Writing', 'Research', 'Development'];


//   useEffect(() => {
//     if (hasMounted && sessionStatus === "unauthenticated") {
//       router.replace("/login");
//     }
//   }, [hasMounted, sessionStatus, router]);


//   useEffect(() => {
//     if (hasMounted) {
//       const current = new URLSearchParams(Array.from(searchParams.entries()));

//       if (searchTerm) {
//         current.set('q', searchTerm);
//       } else {
//         current.delete('q');
//       }

//       if (category !== 'ALL') {
//         current.set('category', category);
//       } else {
//         current.delete('category');
//       }

//       if (status !== 'ALL') {
//         current.set('status', status);
//       } else {
//         current.delete('status');
//       }

//       current.set('sortByField', sortByField);
//       current.set('sortOrder', sortOrder);
//       current.set('page', String(page));

//       const query = current.toString();
//       const newUrl = query ? `?${query}` : '';
//       router.replace(newUrl);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   }, [page, searchTerm, category, status, sortByField, sortOrder, router, hasMounted, searchParams]);


//   useEffect(() => {
//     if (!hasMounted || sessionStatus !== "authenticated" || !currentUser?.id) {
//       if (workRequests.length > 0) {
//         setWorkRequests([]);
//         setTotalPages(1);
//       }
//       return;
//     }

//     const fetchMyWorkRequests = async () => {
//       setLoading(true);
//       try {
//         const queryParams = new URLSearchParams({
//           page,
//           limit,
//           userId: currentUser.id,
//           ...(status !== 'ALL' && { status }),
//           ...(category !== 'ALL' && { category }),
//           sortByField,
//           sortOrder,
//           ...(debouncedSearchTerm && { q: debouncedSearchTerm }),
//         });

//         const res = await fetch(`/api/my-work-requests?${queryParams.toString()}`);
//         if (!res.ok) throw new Error("Failed to fetch work requests");

//         const { data, pagination } = await res.json();
//         setWorkRequests(data);
//         setTotalPages(pagination.totalPages);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching my work requests:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMyWorkRequests();
//   }, [
//     page, limit, category, status, sortByField, sortOrder, debouncedSearchTerm,
//     hasMounted, sessionStatus, currentUser,
//   ]);

//   if (sessionStatus === "loading") {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <FaSpinner className="animate-spin text-4xl text-gray-500" />
//         <p className="ml-4 text-lg text-gray-700">Checking authentication...</p>
//       </div>
//     );
//   }

//   if (sessionStatus === "unauthenticated") {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <FaSpinner className="animate-spin text-4xl text-gray-500" />
//         <p className="ml-4 text-lg text-gray-700">Redirecting to login...</p>
//       </div>
//     );
//   }

//   if (!hasMounted) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <FaSpinner className="animate-spin text-4xl text-gray-500" />
//         <p className="ml-4 text-lg text-gray-700">Loading component...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
//       {error && <p className="text-red-500">Error: {error}</p>}

//       <h2 className="text-3xl font-bold mb-6">My Work Requests</h2>

//       {/* NEW: Container for filters and the "Add New Work Request" button */}
//       <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
//         {/* Filters */}
//         <FilterControls
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           category={category}
//           setCategory={setCategory}
//           status={status}
//           setStatus={setStatus}
//           statusOptions={statusOptions}
//           sortByField={sortByField}
//           setSortByField={setSortByField}
//           sortOrder={sortOrder}
//           setSortOrder={setSortOrder}
//           categories={availableCategories}
//         />

//         {/* Add Work Request Button */}
//         {currentUser?.role === 'COUNCIL' && (
//           // Add `md:ml-auto` to push it to the right on medium screens and above
//           // `mt-4 md:mt-0` for spacing on small screens only
//           <div className="mt-4 md:mt-0 md:ml-auto">
//             <button
//               onClick={async () => {
//                 setRedirecting(true);
//                 await new Promise(resolve => setTimeout(resolve, 100));
//                 router.push('/new-work-request');
//               }}
//               disabled={redirecting}
//               className={clsx(
//                 "font-medium px-6 py-2 rounded-md shadow-md transition duration-300",
//                 redirecting
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-primary hover:bg-primary-dark text-white"
//               )}
//             >
//               {redirecting ? (
//                 <div className="flex items-center gap-2">
//                   <FaSpinner className="animate-spin" />
//                   Loading...
//                 </div>
//               ) : (
//                 "+ Add New Work Request"
//               )}
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Work Requests Display */}
//       {loading ? (
//         <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
//       ) : workRequests.length === 0 ? (
//         <p className="text-center text-gray-600 mt-10">No work requests found matching your criteria.</p>
//       ) : (
//         <div className="grid grid-cols-1 gap-8">
//           {workRequests.map(request => (
//             <DataCard
//               key={request.id}
//               workRequest={request}
//               currentUser={currentUser}
//               showStatus={true}
//               onView={async (req) => {
//                 const res = await fetch(`/api/work-request/${req.id}`, {
//                   headers: {
//                     'x-user-id': currentUser.id,
//                   },
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

// export default MyWorkRequest;


// // File: src/app/my-work-request/page.js

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import DataCard from "../components/DataCard";
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import WorkRequestModal from "../components/WorkRequestModal";
// import { FaSpinner } from 'react-icons/fa';
// import clsx from "clsx";
// import FilterControls from '../components/FilterControls';
// import { useHasMounted } from '@/hooks/useHasMounted';
// import { useTheme } from '@/context/ThemeProvider';

// // Custom hook for debouncing a value
// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// };


// const MyWorkRequest = () => {
//   const hasMounted = useHasMounted();
//   const { currentUser } = useCurrentUser();
//   const { data: session, status: sessionStatus } = useSession();

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { theme } = useTheme();

//   const [workRequests, setWorkRequests] = useState([]);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [redirecting, setRedirecting] = useState(false);

//   const [limit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const initialPage = parseInt(searchParams.get("page")) || 1;
//   const [page, setPage] = useState(initialPage);

//   const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
//   const debouncedSearchTerm = useDebounce(searchTerm, 500);

//   const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
//   const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
//   const [sortByField, setSortByField] = useState(searchParams.get('sortByField') || 'createdAt');
//   const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

//   const statusOptions = [
//     { value: 'ALL', label: 'All' },
//     { value: 'OPEN', label: 'Open' },
//     { value: 'IN_PROGRESS', label: 'In Progress' },
//     { value: 'CLOSED', label: 'Closed' },
//     // If you have 'CANCELLED' in your Prisma enum:
//     // { value: 'CANCELLED', label: 'Cancelled' },
//   ];

//   const availableCategories = ['Design', 'Writing', 'Research', 'Development'];


//   useEffect(() => {
//     if (hasMounted && sessionStatus === "unauthenticated") {
//       router.replace("/login");
//     }
//   }, [hasMounted, sessionStatus, router]);

//   // NEW useEffect for handling URL parameters for modal opening
//   useEffect(() => {
//     const fetchAndOpenModal = async () => {
//       const requestIdParam = searchParams.get('requestId');
//       const openForBids = searchParams.get('bid') === 'true'; // Check for bid parameter

//       if (requestIdParam && currentUser?.id) {
//         setLoading(true);
//         try {
//           const res = await fetch(`/api/work-request/${requestIdParam}`, {
//             headers: { 'x-user-id': currentUser.id },
//           });
//           if (res.ok) {
//             const requestData = await res.json();
//             setSelectedRequest(requestData);
//             // The openForBids flag will be passed directly to WorkRequestModal
//           } else {
//             console.error('Failed to fetch work request for modal:', res.statusText);
//             setError('Failed to load work request details.');
//           }
//         } catch (err) {
//           console.error('Error fetching work request for modal:', err);
//           setError('Error loading work request details.');
//         } finally {
//           setLoading(false);
//           // Clean up URL parameters to prevent modal from reopening on refresh
//           const newSearchParams = new URLSearchParams(searchParams);
//           newSearchParams.delete('requestId');
//           newSearchParams.delete('bid'); // Also remove 'bid' param
//           // Preserve other existing search params
//           router.replace(`?${newSearchParams.toString()}`, { scroll: false });
//         }
//       }
//     };

//     if (currentUser?.id) {
//       fetchAndOpenModal();
//     }
//   }, [searchParams, currentUser, router]); // Dependency array should include searchParams, currentUser, router


//   useEffect(() => {
//     if (hasMounted) {
//       const current = new URLSearchParams(Array.from(searchParams.entries()));

//       if (searchTerm) {
//         current.set('q', searchTerm);
//       } else {
//         current.delete('q');
//       }

//       if (category !== 'ALL') {
//         current.set('category', category);
//       } else {
//         current.delete('category');
//       }

//       if (status !== 'ALL') {
//         current.set('status', status);
//       } else {
//         current.delete('status');
//       }

//       current.set('sortByField', sortByField);
//       current.set('sortOrder', sortOrder);
//       current.set('page', String(page));

//       // Ensure 'requestId' and 'bid' are NOT set by the filter/pagination logic
//       current.delete('requestId');
//       current.delete('bid');

//       const query = current.toString();
//       const newUrl = query ? `?${query}` : '';
//       router.replace(newUrl);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   }, [page, searchTerm, category, status, sortByField, sortOrder, router, hasMounted, searchParams]);


//   useEffect(() => {
//     if (!hasMounted || sessionStatus !== "authenticated" || !currentUser?.id) {
//       if (workRequests.length > 0) {
//         setWorkRequests([]);
//         setTotalPages(1);
//       }
//       return;
//     }

//     const fetchMyWorkRequests = async () => {
//       setLoading(true);
//       try {
//         const queryParams = new URLSearchParams({
//           page,
//           limit,
//           userId: currentUser.id,
//           ...(status !== 'ALL' && { status }),
//           ...(category !== 'ALL' && { category }),
//           sortByField,
//           sortOrder,
//           ...(debouncedSearchTerm && { q: debouncedSearchTerm }),
//         });

//         const res = await fetch(`/api/my-work-requests?${queryParams.toString()}`);
//         if (!res.ok) throw new Error("Failed to fetch work requests");

//         const { data, pagination } = await res.json();
//         setWorkRequests(data);
//         setTotalPages(pagination.totalPages);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching my work requests:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMyWorkRequests();
//   }, [
//     page, limit, category, status, sortByField, sortOrder, debouncedSearchTerm,
//     hasMounted, sessionStatus, currentUser,
//   ]);

//   if (sessionStatus === "loading") {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <FaSpinner className="animate-spin text-4xl text-gray-500" />
//         <p className="ml-4 text-lg text-gray-700">Checking authentication...</p>
//       </div>
//     );
//   }

//   if (sessionStatus === "unauthenticated") {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <FaSpinner className="animate-spin text-4xl text-gray-500" />
//         <p className="ml-4 text-lg text-gray-700">Redirecting to login...</p>
//       </div>
//     );
//   }

//   if (!hasMounted) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <FaSpinner className="animate-spin text-4xl text-gray-500" />
//         <p className="ml-4 text-lg text-gray-700">Loading component...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
//       {error && <p className="text-red-500">Error: {error}</p>}

//       <h2 className="text-3xl font-bold mb-6">My Work Requests</h2>

//       {/* NEW: Container for filters and the "Add New Work Request" button */}
// {/*       <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6"> */}
//       <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-x-8 mb-6">
//         {/* Filters */}
//         <FilterControls
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           category={category}
//           setCategory={setCategory}
//           status={status}
//           setStatus={setStatus}
//           statusOptions={statusOptions}
//           sortByField={sortByField}
//           setSortByField={setSortByField}
//           sortOrder={sortOrder}
//           setSortOrder={setSortOrder}
//           categories={availableCategories}
//         />

//         {/* Add Work Request Button */}
//         {currentUser?.role === 'COUNCIL' && (
//           // Add `md:ml-auto` to push it to the right on medium screens and above
//           // `mt-4 md:mt-0` for spacing on small screens only
//           <div className="mt-4 md:mt-0 md:ml-auto">
//             <button
//               onClick={async () => {
//                 setRedirecting(true);
//                 await new Promise(resolve => setTimeout(resolve, 100));
//                 router.push('/new-work-request');
//               }}
//               disabled={redirecting}
//               className={clsx(
//                 "font-medium px-6 py-2 rounded-md shadow-md transition duration-300",
//                 redirecting
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-primary hover:bg-primary-dark text-white"
//               )}
//             >
//               {redirecting ? (
//                 <div className="flex items-center gap-2">
//                   <FaSpinner className="animate-spin" />
//                   Loading...
//                 </div>
//               ) : (
//                 "+ Add New Work Request"
//               )}
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Work Requests Display */}
//       {loading ? (
//         <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
//       ) : workRequests.length === 0 ? (
//         <p className="text-center text-gray-600 mt-10">No work requests found matching your criteria.</p>
//       ) : (
//         <div className="grid grid-cols-1 gap-8">
//           {workRequests.map(request => (
//             <DataCard
//               key={request.id}
//               workRequest={request}
//               currentUser={currentUser}
//               showStatus={true}
//               onView={async (req) => {
//                 const res = await fetch(`/api/work-request/${req.id}`, {
//                   headers: {
//                     'x-user-id': currentUser.id,
//                   },
//                 });
//                 const fullRequest = await res.json();
//                 setSelectedRequest(fullRequest);
//               }}
//             />
//           ))}
//         </div>
//       )}

//       {/* Pagination Controls */}
//       <div className="flex items-center justify-between mt-10">
//         <button
//           onClick={() => setPage(prev => Math.max(prev - 1, 1))}
//           disabled={page <= 1}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
//         >
//           Previous
//         </button>

//         <div className="flex items-center gap-2">
//           <span className="text-sm">Page</span>
//           <input
//             type="number"
//             value={page}
//             onChange={(e) => {
//               const val = parseInt(e.target.value);
//               if (!isNaN(val) && val > 0 && val <= totalPages) {
//                 setPage(val);
//               }
//             }}
//             className="w-16 border rounded px-2 py-1 text-center"
//           />
//           <span className="text-sm">of {totalPages || 1}</span>
//         </div>

//         <button
//           onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
//           disabled={page >= totalPages}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>

//       {selectedRequest && (
//         <WorkRequestModal
//           workRequest={selectedRequest}
//           currentUser={currentUser}
//           onClose={() => setSelectedRequest(null)}
//           onDeleted={(id) => {
//             setWorkRequests(prev => prev.filter(req => req.id !== id));
//             setSelectedRequest(null);
//           }}
//           // Pass the flag indicating to open the bids tab
//           openBidsTab={searchParams.get('bid') === 'true'}
//           // Also pass existing submission/message flags if your modal uses them
//           submissionFlag={searchParams.get('submission') === 'true'}
//           messageFlag={searchParams.get('message') === 'true'}
//         />
//       )}
//     </div>
//   );
// };

// export default MyWorkRequest;



// File: src/app/my-work-request/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DataCard from "../components/DataCard";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import WorkRequestModal from "../components/WorkRequestModal";
import { FaSpinner, FaPlus } from 'react-icons/fa'; // Import FaPlus
import clsx from "clsx";
import FilterControls from '../components/FilterControls';
import { useHasMounted } from '@/hooks/useHasMounted';
import { useTheme } from '@/context/ThemeProvider';

// Custom hook for debouncing a value
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


const MyWorkRequest = () => {
  const hasMounted = useHasMounted();
  const { currentUser } = useCurrentUser();
  const { data: session, status: sessionStatus } = useSession();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const [workRequests, setWorkRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [sortByField, setSortByField] = useState(searchParams.get('sortByField') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  const statusOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'CLOSED', label: 'Closed' },
    // If you have 'CANCELLED' in your Prisma enum:
    // { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const availableCategories = ['Design', 'Writing', 'Research', 'Development'];


  useEffect(() => {
    if (hasMounted && sessionStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [hasMounted, sessionStatus, router]);

  // NEW useEffect for handling URL parameters for modal opening
  useEffect(() => {
    const fetchAndOpenModal = async () => {
      const requestIdParam = searchParams.get('requestId');
      const openForBids = searchParams.get('bid') === 'true'; // Check for bid parameter

      if (requestIdParam && currentUser?.id) {
        setLoading(true);
        try {
          const res = await fetch(`/api/work-request/${requestIdParam}`, {
            headers: { 'x-user-id': currentUser.id },
          });
          if (res.ok) {
            const requestData = await res.json();
            setSelectedRequest(requestData);
            // The openForBids flag will be passed directly to WorkRequestModal
          } else {
            console.error('Failed to fetch work request for modal:', res.statusText);
            setError('Failed to load work request details.');
          }
        } catch (err) {
          console.error('Error fetching work request for modal:', err);
          setError('Error loading work request details.');
        } finally {
          setLoading(false);
          // Clean up URL parameters to prevent modal from reopening on refresh
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('requestId');
          newSearchParams.delete('bid'); // Also remove 'bid' param
          // Preserve other existing search params
          router.replace(`?${newSearchParams.toString()}`, { scroll: false });
        }
      }
    };

    if (currentUser?.id) {
      fetchAndOpenModal();
    }
  }, [searchParams, currentUser, router]); // Dependency array should include searchParams, currentUser, router


  useEffect(() => {
    if (hasMounted) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      if (searchTerm) {
        current.set('q', searchTerm);
      } else {
        current.delete('q');
      }

      if (category !== 'ALL') {
        current.set('category', category);
      } else {
        current.delete('category');
      }

      if (status !== 'ALL') {
        current.set('status', status);
      } else {
        current.delete('status');
      }

      current.set('sortByField', sortByField);
      current.set('sortOrder', sortOrder);
      current.set('page', String(page));

      // Ensure 'requestId' and 'bid' are NOT set by the filter/pagination logic
      current.delete('requestId');
      current.delete('bid');

      const query = current.toString();
      const newUrl = query ? `?${query}` : '';
      router.replace(newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, searchTerm, category, status, sortByField, sortOrder, router, hasMounted, searchParams]);


  useEffect(() => {
    if (!hasMounted || sessionStatus !== "authenticated" || !currentUser?.id) {
      if (workRequests.length > 0) {
        setWorkRequests([]);
        setTotalPages(1);
      }
      return;
    }

    const fetchMyWorkRequests = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          userId: currentUser.id,
          ...(status !== 'ALL' && { status }),
          ...(category !== 'ALL' && { category }),
          sortByField,
          sortOrder,
          ...(debouncedSearchTerm && { q: debouncedSearchTerm }),
        });

        const res = await fetch(`/api/my-work-requests?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch work requests");

        const { data, pagination } = await res.json();
        setWorkRequests(data);
        setTotalPages(pagination.totalPages);
        setError(null);
      } catch (err) {
        console.error("Error fetching my work requests:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyWorkRequests();
  }, [
    page, limit, category, status, sortByField, sortOrder, debouncedSearchTerm,
    hasMounted, sessionStatus, currentUser,
  ]);

  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Loading component...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      {error && <p className="text-red-500">Error: {error}</p>}

      <h2 className="text-3xl font-bold mb-6">My Work Requests</h2>

      {/* NEW: Container for filters and the "Add New Work Request" button */}
      {/* Uses flex-wrap for filters to wrap, and ml-auto on the button to push it right on large screens */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        {/* Filters - Allowing FilterControls to take up space, potentially wrapping its own contents */}
        <div className="flex-grow"> {/* Added flex-grow to make filter controls take available space */}
            <FilterControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                category={category}
                setCategory={setCategory}
                status={status}
                setStatus={setStatus}
                statusOptions={statusOptions}
                sortByField={sortByField}
                setSortByField={setSortByField}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                categories={availableCategories}
            />
        </div>

        {/* Add Work Request Button - conditional rendering for text vs icon */}
        {currentUser?.role === 'COUNCIL' && (
          <div className="mt-4 lg:mt-0 lg:ml-auto flex-shrink-0"> {/* flex-shrink-0 prevents button from shrinking */}
            <button
              onClick={async () => {
                setRedirecting(true);
                await new Promise(resolve => setTimeout(resolve, 10));
                router.push('/new-work-request');
              }}
              disabled={redirecting}
              className={clsx(
                "font-medium px-4 py-2 rounded-md shadow-md transition duration-300",
                redirecting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark text-white",
                "flex items-center justify-center", // For icon centering
                "sm:w-auto w-10 h-10 lg:w-auto lg:h-auto" // Fixed size for small, auto for large
              )}
            >
              {redirecting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <span className="hidden lg:inline">+ Add New Work Request</span> {/* Text for large screens */}
                  <FaPlus className="lg:hidden text-lg" /> {/* Icon for small screens */}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Work Requests Display */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
      ) : workRequests.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No work requests found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {workRequests.map(request => (
            <DataCard
              key={request.id}
              workRequest={request}
              currentUser={currentUser}
              showStatus={true}
              onView={async (req) => {
                const res = await fetch(`/api/work-request/${req.id}`, {
                  headers: {
                    'x-user-id': currentUser.id,
                  },
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

      {selectedRequest && (
        <WorkRequestModal
          workRequest={selectedRequest}
          currentUser={currentUser}
          onClose={() => setSelectedRequest(null)}
          onDeleted={(id) => {
            setWorkRequests(prev => prev.filter(req => req.id !== id));
            setSelectedRequest(null);
          }}
          // Pass the flag indicating to open the bids tab
          openBidsTab={searchParams.get('bid') === 'true'}
          // Also pass existing submission/message flags if your modal uses them
          submissionFlag={searchParams.get('submission') === 'true'}
          messageFlag={searchParams.get('message') === 'true'}
        />
      )}
    </div>
  );
};

export default MyWorkRequest;