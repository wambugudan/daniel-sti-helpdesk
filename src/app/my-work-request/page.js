// // File: src/app/my-work-request/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import DataCard from "../components/DataCard";
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import WorkRequestModal from "../components/WorkRequestModal";
// import ModalListener from '../components/ModalListener';
// import { FaSpinner } from 'react-icons/fa';
// import clsx from "clsx";


// const MyWorkRequest = () => {
//   // const { currentUser } = useCurrentUser();
//   const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
  

//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [workRequests, setWorkRequests] = useState([]);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [redirecting, setRedirecting] = useState(false);

//   const [limit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);

//   const initialPage = parseInt(searchParams.get("page")) || 1;
//   const [page, setPage] = useState(initialPage);

//   useEffect(() => {
//     router.replace(`?page=${page}`);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, [page, router]);

//   useEffect(() => {
//     const fetchWorkRequests = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/my-work-requests?userId=${currentUser.id}&page=${page}&limit=${limit}`);
//         if (!res.ok) throw new Error("Failed to fetch work requests");

//         const { data, total } = await res.json();
//         setWorkRequests(data);
//         setTotalPages(Math.ceil(total / limit));
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching my work requests:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (currentUser?.id) fetchWorkRequests();
//   }, [currentUser, page, limit]);

//   return (
//     <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
//       {/* Modal listener for handling the modal open */}
//       <ModalListener currentUser={currentUser} />
//       {error && <p className="text-red-500">Error: {error}</p>}

//       <h2 className="text-xl font-semibold mb-6">My Work Requests</h2>

//       {/* Add Work Request Button */}
//       {currentUser?.role === 'COUNCIL' && (
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

//       {loading ? (
//         <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
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
//                     'x-user-id': currentUser.id, // send user ID to backend for filtering
//                   },
//                 })
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


// File: src/app/my-work-request/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useSession } from 'next-auth/react'; // Ensure useSession is imported
// import DataCard from "../components/DataCard";
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import WorkRequestModal from "../components/WorkRequestModal";
// // Assuming ModalListener is for something else, not directly related to filters
// // import ModalListener from '../components/ModalListener';
// import { FaSpinner } from 'react-icons/fa';
// import clsx from "clsx";
// import FilterControls from '../components/FilterControls'; // Import FilterControls
// import { useHasMounted } from '@/hooks/useHasMounted'; // Assuming useHasMounted is available
// import { useTheme } from '@/context/ThemeProvider'; // Assuming useTheme is available


// // Custom hook for debouncing a value (re-using from submissions page)
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
//   const hasMounted = useHasMounted(); // For client-side rendering check
//   const { currentUser } = useCurrentUser();
//   const { data: session, status: sessionStatus } = useSession(); // To check authentication status

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { theme } = useTheme(); // For theme-based styling if needed elsewhere

//   const [workRequests, setWorkRequests] = useState([]);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [limit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);

//   const initialPage = parseInt(searchParams.get("page")) || 1;
//   const [page, setPage] = useState(initialPage);

//   const [redirecting, setRedirecting] = useState(false);

//   // Filter/Sort States
//   const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
//   const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search

//   const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
//   const [status, setStatus] = useState(searchParams.get('status') || 'ALL'); // NEW: Status state
//   const [sortByField, setSortByField] = useState(searchParams.get('sortByField') || 'createdAt');
//   const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

//   // Define status options for the filter
//   const statusOptions = [
//     { value: 'ALL', label: 'All' },
//     { value: 'OPEN', label: 'Open' },
//     { value: 'IN_PROGRESS', label: 'In Progress' },
//     { value: 'CLOSED', label: 'Closed' },
//     // { value: 'CANCELLED', label: 'Cancelled' },
//     // Add any other statuses you have in your schema
//   ];

//   // Define available categories (can be dynamic if fetched from API)
//   const availableCategories = ['Design', 'Writing', 'Research', 'Development'];


//   // Redirect to login if unauthenticated
//   useEffect(() => {
//     if (hasMounted && sessionStatus === "unauthenticated") {
//       router.replace("/login");
//     }
//   }, [hasMounted, sessionStatus, router]);


//   // Effect to update URL search parameters and scroll to top
//   useEffect(() => {
//     if (hasMounted) {
//       const current = new URLSearchParams(Array.from(searchParams.entries()));

//       // Set/delete search term
//       if (searchTerm) {
//         current.set('q', searchTerm);
//       } else {
//         current.delete('q');
//       }

//       // Set/delete category
//       if (category !== 'ALL') {
//         current.set('category', category);
//       } else {
//         current.delete('category');
//       }

//       // Set/delete status
//       if (status !== 'ALL') {
//         current.set('status', status);
//       } else {
//         current.delete('status');
//       }

//       // Set sort fields
//       current.set('sortByField', sortByField);
//       current.set('sortOrder', sortOrder);

//       // Always set page
//       current.set('page', String(page));

//       const query = current.toString();
//       const newUrl = query ? `?${query}` : '';
//       router.replace(newUrl);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   }, [page, searchTerm, category, status, sortByField, sortOrder, router, hasMounted, searchParams]);


//   // Effect to fetch work requests based on filters and current user
//   useEffect(() => {
//     // Only fetch if mounted, authenticated, and currentUser is available
//     if (!hasMounted || sessionStatus !== "authenticated" || !currentUser?.id) {
//       // Clear data if not authenticated/user missing
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
//           userId: currentUser.id, // IMPORTANT: Fetch requests for the current user
//           ...(status !== 'ALL' && { status }), // Apply status filter
//           ...(category !== 'ALL' && { category }), // Apply category filter
//           sortByField, // Apply sort by field
//           sortOrder, // Apply sort order
//           ...(debouncedSearchTerm && { q: debouncedSearchTerm }), // Apply debounced search term
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
//     // Add all relevant dependencies to re-fetch when filters/sort/page changes
//   }, [
//     page, limit, category, status, sortByField, sortOrder, debouncedSearchTerm,
//     hasMounted, sessionStatus, currentUser, // currentUser is essential for user-specific data
//     // Do NOT include workRequests here unless you have a specific reason to re-fetch on every data change
//   ]);

//   // Loading/Authentication status checks
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
//       {/* <ModalListener currentUser={currentUser} /> */}
//       {error && <p className="text-red-500">Error: {error}</p>}

//       <h2 className="text-2xl font-bold mb-6">My Work Requests</h2>

//       {/* Filter Controls */}
//       <FilterControls
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         category={category}
//         setCategory={setCategory}
//         status={status}            // Pass status state
//         setStatus={setStatus}       // Pass status setter
//         statusOptions={statusOptions} // Pass status options
//         sortByField={sortByField}
//         setSortByField={setSortByField}
//         sortOrder={sortOrder}
//         setSortOrder={setSortOrder}
//         categories={availableCategories} // Pass actual categories
//       />

//       {/* Add Work Request Button */}
//       {currentUser?.role === 'COUNCIL' && (
//         <div className="flex justify-end mb-6">
//           <button
//             onClick={async () => {
//               setRedirecting(true);
//               await new Promise(resolve => setTimeout(resolve, 100));
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

// File: src/app/my-work-request/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DataCard from "../components/DataCard";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import WorkRequestModal from "../components/WorkRequestModal";
import { FaSpinner } from 'react-icons/fa';
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
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        {/* Filters */}
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

        {/* Add Work Request Button */}
        {currentUser?.role === 'COUNCIL' && (
          // Add `md:ml-auto` to push it to the right on medium screens and above
          // `mt-4 md:mt-0` for spacing on small screens only
          <div className="mt-4 md:mt-0 md:ml-auto">
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
        />
      )}
    </div>
  );
};

export default MyWorkRequest;